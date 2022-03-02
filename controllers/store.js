/**
 * Created by tharindu on 2/15/2018.
 */
const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const dates = require('date-and-time');
const fs = require('fs');
const csv = require('fast-csv');
const userBranchQuery= mysqlDB.getQuery('branch');
const imageConfig = require('../images.config.json');



/**
 * List store page
 */
router.get(base.router.getPattern('get.store.list'), function (req, res, next) {
    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');

    stores.state = 1;
    stores.barcodePart = '';
    stores.productNamePart = '';
    stores.branchId = req.session.branch;
    stores.offset = 0;
    stores.limit = 20;


    storesQuery.filterStoresByBarcodeProductName(stores, function (output) {
        if( output !== undefined){
        userBranchQuery.getBranches(function (branchData) {
            let branchDataUser = branchData;
            output.branchId = req.session.branch;
            let currentRoute = 'get.store.list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_store_list', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                branches: branchDataUser,
                images:{profile:profile,logo:logo}
            });
        });
    }else{
        res.send(500);

    }
    });
 

});



/**
 * List zero qty store page
 */
 router.get(base.router.getPattern('post.store.zero_quantity_delete'), function (req, res, next) {

    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');

    if (req.session.role == "1" || req.session.role == "4"){
        stores.state = 1;
        stores.barcodePart = '';
        stores.productNamePart = '';
        stores.offset = 0;
        //stores.limit = 200;
        
        storesQuery.filterStoresByZeroQtyAdmin(stores, function (output) {
        let temp_arr = [];
        for (let i = 0; i < output.length; i++) {
            temp_arr.push(output[i].id);  
        };
        
        if (temp_arr.length != 0){
            let stores_query = mysqlDB.getQuery('stores');
            stores_query.bulkDeleteStores(temp_arr,function(output){
                res.send (output);
                });
        }

        });

    } else {

            stores.state = 1;
            stores.barcodePart = '';
            stores.productNamePart = '';
            stores.branchId = req.session.branch;
            stores.offset = 0;
 
            storesQuery.filterStoresByZeroQtyManager(stores, function (output) {
                temp_arr = [];
                for (let i = 0; i < output.length; i++) {
                    temp_arr.push(output[i].id);
                };

                if (temp_arr.length != 0){
                    let stores_query = mysqlDB.getQuery('stores');
                    stores_query.bulkDeleteStores(temp_arr,function(output){
                        res.send (output);
                    });


                }

                
            });
    }

});
/**
 * Inactive List store page
 */
 router.get(base.router.getPattern('get.store.inactive_list'), function (req, res, next) {
    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');
    stores.state = 0;
    stores.barcodePart = '';
    stores.productNamePart = '';
    stores.branchId = req.session.branch;
    stores.offset = 0;
    stores.limit = 20;

    storesQuery.filterStoresByBarcodeProductName(stores, function (output) {
        if (output !== undefined){
            userBranchQuery.getBranches(function (branchData) {
                let branchDataUser = branchData;
                output.branchId = req.session.branch;
                let currentRoute = 'get.store.inactive_list';
                let profile =JSON.stringify(imageConfig.images.profile.file)
                let logo=JSON.stringify(imageConfig.images.logo.file)
                res.render('backend/store/manager_store_inactive_list', {
                    results: output,
                    route: currentRoute,
                    user: base.getCurrentUser(req),
                    branches: branchDataUser,
                    images:{profile:profile,logo:logo}
                });
            });

        }else{
            res.send(500);
        }
    });

});

/**
 * render stores edit page
 */
router.get(base.router.getPattern('get.store.edit'), function (req, res, next) {
    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');
    // console.log('=================')
    // console.log(req.query);
    stores.id = parseInt(req.query.id);
    storesQuery.getByStoresId(stores, function (output) {
        
        
        if (output !== undefined){
            let currentRoute = 'get.store.edit';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_edit_store', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });

        }else{
            res.send(500);

        }
    });
    
});

/**
 * update store action
 */
router.post(base.router.getPattern('post.store.update'), function (req, res, next) {

    req.body.modelName = 'stores';
    req.body.id = parseInt(req.body.id);
    req.body.reorderLevel = parseInt(req.body.reorderLevel);
    req.body.qty = parseInt(req.body.qty);
    req.body.minOrderQuantity = parseInt(req.body.minOrderQuantity);
    req.body.quantity = parseInt(req.body.quantity);
  
    if( req.body.qty != req.body.quantity){
        let now = new Date();
        const myCars = String(["\"" + dates.format(now, 'MM/DD/YYYY HH:mm:ss')+ "\"","\"" + req.body.username + "\"", "\"" + req.body.userid + "\"", "\"" + req.body.role +"\"", "\"" +req.body.barcode + "\"", "\"" +req.body.productName + "\"", "\"" + req.body.quantity  + "\"", "\"" + req.body.qty + "\"", "\"" + req.body.branch_name+"\"" ]);

        fs.appendFile('./public/session/files/store_list-audit.csv', '\n' + myCars + '', (err) => {
            if (err) throw err;

        });

    }
    
    
    let store = base.requestToModel(req.body);
    console.log('stores update///////////////////',store)
    let storeQuery = mysqlDB.getQuery('stores');
    storeQuery.updateStoresRolMoq(store, function (output) {
        res.redirect('/Store' + base.router.getPattern('get.store.list'));
    });

});


/**
 * session analysis
 */
router.get(base.router.getPattern('get.store.reports'), function (req, res) {


    let stream = fs.createReadStream("./public/session/files/store_list-audit.csv");
    let csv_data = [];
    csv.parseStream(stream, {ignoreEmpty: true}).on("data", function (data) {
        csv_data.push(data);

        console.log(base)

    }).on("end", function () {
        let currentRoute = 'get.store.reports';
        let profile =JSON.stringify(imageConfig.images.profile.file)
        let logo=JSON.stringify(imageConfig.images.logo.file)

        console.log(base.getCurrentUser(req))
        console.log(currentRoute)

        res.render('backend/pos/store', {

            result: csv_data,
            user: base.getCurrentUser(req),
            route: currentRoute,
            images:{profile:profile,logo:logo}

        });
    });


});

/**
 * delete store action
 */
router.post(base.router.getPattern('post.store.delete'), function (req, res, next) {
    let storesQuery = mysqlDB.getQuery('stores');
    let stores = mysqlDB.getModel('stores');
    stores.id = (req.body.id);
    stores.state = 0;
    storesQuery.deleteStores(stores, function (output) {
        res.send('successfull');
    });
});

/**
 *active store action
 */
 router.post(base.router.getPattern('post.store.activate'), function (req, res, next) {
    let stores =mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');
    stores.id = req.body.store_id;
    stores.state = 1;
    storesQuery.activeStores(stores, function (output) {    
        res.redirect('/stores' + base.router.getPattern('get.store.inactive_list'));
    });
});

/**
 * get stores order generation page
 */
router.get(base.router.getPattern('get.store.order'), function (req, res, next) {

    let storesModel = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');
    storesModel.branchId = req.session.branch;
    storesQuery.getOrderedProducts(storesModel, function (output) {
        output.branchId = req.session.branch;
        output.grnNo = 'OR' + Math.floor(Math.random() * 10000000);

        if(output !== undefined){

            userBranchQuery.getBranches(function (branchData) {
                let branchDataUser = branchData;
                let currentRoute = 'get.store.order';
                let profile =JSON.stringify(imageConfig.images.profile.file)
                let logo=JSON.stringify(imageConfig.images.logo.file)
                res.render('backend/store/manager_order_generation', {
                    results: output,
                    route: currentRoute,
                    user: base.getCurrentUser(req),
                    branches:branchDataUser,
                    images:{profile:profile,logo:logo},
                });
            });

        }else{
            res.send(500);
        }
    });

});

/**
 * render oder requests page  action
 */
router.get(base.router.getPattern('get.store.order_requests'), function (req, res, next) {
    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.destination = req.session.branch;
    transferManagementSummaryQuery.getOrderRequests(transferManagementSummaryModel, function (output) {
        output.branchId = req.session.branch;

        if(output !== undefined){

            let currentRoute = 'get.store.order_requests';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_order_requests', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });
        }else{
            res.send(500)
        }
    });
    
});
router.post(base.router.getPattern('post.store.order_request_list_delete'), function (req, res, next) {
let transferInfoQuery = mysqlDB.getQuery('transfer_management_info');
 console.log('rew.bogyd id',req.body.id)
 transferId = parseInt(req.body.id);
 transferInfoQuery.updateOrderRequestDelete(transferId, function (output) {
    console.log('update transfer')
    res.send(output)

 })
})
/**
 * render order requests  detail  page action
 */
router.get(
  base.router.getPattern("get.store.order_request_list"),
  function (req, res, next) {
    let transferManagementInfoModel = mysqlDB.getModel(
      "transfer_management_info"
    );
    let transferManagementInfoQuery = mysqlDB.getQuery(
      "transfer_management_info"
    );

    let transferTypeQuery = mysqlDB.getQuery("transfer_type");
    let transferTypeModel = mysqlDB.getModel("transfer_type");

    let branchModel = mysqlDB.getModel("branch");
    let branchQuery = mysqlDB.getQuery("branch");

    let supplierModel = mysqlDB.getModel("supplier");
    let supplierQuery = mysqlDB.getQuery("supplier");

    transferManagementInfoModel.transferId = req.query.id;

    transferManagementInfoQuery.getByTransferId(
      transferManagementInfoModel,
      function (status, output) {
        supplierQuery.getAllSuppliers(supplierModel, function (supplierResult) {
          branchQuery.getAllBranches(branchModel, function (branchResult) {
            transferTypeQuery.getAllTransferTypes(
              transferTypeModel,
              function (transferTypeResult) {
                output.branchId = req.session.branch;
                output.transferId = req.query.id;
                let storeTransfer = 2;

                transferManagementInfoQuery.getByTransferIdOrderRequest(
                  output.branchId,
                  output.transferId,
                  function (resultnew) {
                    let transferInfo = {
                      source_id: req.query.source_id,
                      destination_id: req.query.destination_id,
                      source_name: req.query.source_name,
                      destination_name: req.query.destination_name,
                    };
                    transferManagementInfoQuery.getGrnNo(
                      storeTransfer,
                      output.branchId,
                      function (storeTransfer) {
                        // let grn_no_new = "ST-" + output.branchId + "-" + 000001;

                        if (storeTransfer) {
                          let newgrn = storeTransfer[0].grn_no;
                          let str = JSON.stringify(newgrn);
                          let resultstr = str.substr(-7, 6);

                          let resultadd = parseInt(resultstr) + 1;

                          let str3 = resultadd.toString();
                          let str4 = ("000000" + str3).slice(-6);

                          let grn_no_new = "ST-" + output.branchId + "-" + str4;

                          let currentRoute = "get.store.order_request_list";
                          let profile = JSON.stringify(
                            imageConfig.images.profile.file
                          );
                          let logo = JSON.stringify(
                            imageConfig.images.logo.file
                          );
                          res.render(
                            "backend/inventory/manager_add_inventory",
                            {
                              results: output,
                              resultnew: JSON.parse(JSON.stringify(resultnew)),
                              route: currentRoute,
                              user: base.getCurrentUser(req),
                              transferInfo: transferInfo,
                              grnNoOld: req.query.grnNo,
                              grnNo: grn_no_new,
                              images: { profile: profile, logo: logo },
                              transferTypes: transferTypeResult,
                              branches: branchResult,
                              suppliers: supplierResult,
                              currentBranch: req.session.branch,
                            }
                          );
                        } else {
                          let grn_no_new =
                            "ST-" + output.branchId + "-" + "000001";
                          let currentRoute = "get.store.order_request_list";
                          let profile = JSON.stringify(
                            imageConfig.images.profile.file
                          );
                          let logo = JSON.stringify(
                            imageConfig.images.logo.file
                          );
                          res.render(
                            "backend/inventory/manager_add_inventory",
                            {
                              results: output,
                              resultnew: JSON.parse(JSON.stringify(resultnew)),
                              route: currentRoute,
                              user: base.getCurrentUser(req),
                              transferInfo: transferInfo,
                              grnNoOld: req.query.grnNo,
                              grnNo: grn_no_new,
                              images: { profile: profile, logo: logo },
                              transferTypes: transferTypeResult,
                              branches: branchResult,
                              suppliers: supplierResult,
                              currentBranch: req.session.branch,
                            }
                          );
                        }
                      }
                    );
                  }
                );
              }
            );
          });
        });
      }
    );
  }
);

/**
 * accept order request
 */
router.post(base.router.getPattern('post.store.order_accept'), function (req, res, next) {

    let tempString = JSON.stringify(req.body);
    let transferId = parseInt(tempString.replace(/[:"{}]/g, ''));

    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.id = transferId;
    transferManagementSummaryModel.transferStatusId = 1;

    transferManagementSummaryQuery.responseToOrderRequests(transferManagementSummaryModel, function (output) {
        output.branchId = req.session.branch;
        output.transferId = req.query.id;
        res.send(output);
    });

    /* while (results === undefined) {
     require('deasync').runLoopOnce();
     }
     /!*var currentRoute = 'get.store.order_request_list';

     res.redirect('/Store' + base.router.getPattern('get.store.order_requests'));*!/*/
});

/**
 * reject order requests
 */
router.post(base.router.getPattern('post.store.order_reject'), function (req, res, next) {

    let tempString = JSON.stringify(req.body);
    let transferId = parseInt(tempString.replace(/[:"{}]/g, ''));
    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.id = transferId;
    transferManagementSummaryModel.transferStatusId = 3;

    transferManagementSummaryQuery.responseToOrderRequests(transferManagementSummaryModel, function (output) {

        output.branchId = req.session.branch;
        output.transferId = req.query.id;

        if(output !== undefined){
            res.redirect('/Store' + base.router.getPattern('get.store.order_requests'));
        }else{
            res.send(500);

        }
    });
    
});

/**
 * render order requests page  action
 */
router.get(base.router.getPattern('get.store.order_requests'), function (req, res, next) {

    var results;
    var transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    var transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.destination = req.session.branch;
    transferManagementSummaryQuery.getOrderRequests(transferManagementSummaryModel, function (output) {

        output.branchId = req.session.branch;

        if(output !== undefined){
            var currentRoute = 'get.store.order_requests';
            var profile =JSON.stringify(imageConfig.images.profile.file)
            var logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_order_requests', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });

        }else{
            res.send(500);
        }
    });

});

/**
 * list all store ins
 */
router.get(base.router.getPattern('get.store.store_in'), function (req, res, next) {

    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.destination = req.session.branch;
    transferManagementSummaryQuery.getStoreIn(transferManagementSummaryModel, function (output) {
        results = output;

        results.branchId = req.session.branch;
        if (output !== undefined){
            let currentRoute = 'get.store.store_in';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_storein', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });

        }else{
            res.send(500);

        }
    });

    
});

/**
 * render store in  detail  page action
 */
router.get(base.router.getPattern('get.store.store_in_list'), function (req, res, next) {

    let transferManagementInfoModel = mysqlDB.getModel('transfer_management_info');
    let transferManagementInfoQuery = mysqlDB.getQuery('transfer_management_info');

    transferManagementInfoModel.transferId = req.query.id;
    transferManagementInfoQuery.getByTransferId(transferManagementInfoModel, function (status, output) {
        output.branchId = req.session.branch;
        output.transferId = req.query.id;

        if (status){
            let currentRoute = 'get.store.store_in_list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_storein_list', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });

        }else{
            res.send(output);
        }
    });

    
});

/**
 * post store in accepted
 */
router.post(base.router.getPattern('post.store.store_in_accept'), function (req, res, next) {

    let dataIn = req.body;
    let transferId = parseInt(dataIn.orderRequestId);
    let tableData = dataIn.tableData;
    

    let results;
    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.id = transferId;
    transferManagementSummaryModel.transferStatusId = 1;

    transferManagementSummaryModel.id = transferId;
    transferManagementSummaryModel.transferStatusId = 1;

    let transferAll = {};
    for (var key in dataIn) {
        transferAll[key] = dataIn[key];
    }


    transferManagementSummaryQuery.responseToOrderRequests(transferManagementSummaryModel, function (output) {
        results = output;
        
        results.branchId = req.session.branch;
        results.transferId = req.query.id;
        let storesModel = mysqlDB.getModel('stores');
        let transferModel = mysqlDB.getModel('transfer_management_info');
        let storesQuery = mysqlDB.getQuery('stores');
        let transferQuery = mysqlDB.getQuery('transfer_management_info');

        // tableData.forEach(element => {
        //     addToStore(x, function () {
        //         processItems(x + 1);
        //     })
        // });


        let processItems = function (x) {
            if (x < tableData.length) {
                addToStore(x, function () {
                    processItems(x + 1);
                })
            } else {
                console.log('+++++++++++')
                res.redirect('/Store' + base.router.getPattern('get.store.store_in'))
            }
        };
        let processItemsTransfer = function (x) {
            if (x < tableData.length) {
                addToTransfer(x, function () {
                    processItemsTransfer(x + 1);
                })
            }
        };
        function addToTransfer(i, callback) {
             
            transferModel.productId = parseInt(tableData[ i ].productid);
            transferModel.qty = parseInt(tableData[ i ].acceptedquantity);
            transferModel.reject =  parseInt(tableData[ i ].quantity)-parseInt(tableData[ i ].acceptedquantity);
            transferModel.transferId =transferId;
           
            transferQuery.updateTransferConfirm(transferModel, i, function (transferOutput) {
                callback();
            })
         };
         processItemsTransfer(0);
        function addToStore(i, callback) {
                storesModel.productId = parseInt(tableData[ i ].productid);
                storesModel.qty = parseInt(tableData[ i ].acceptedquantity);
                storesModel.branchId = req.session.branch;
        
                storesQuery.updateStoreTransferConfirm(storesModel, i, function (storesOutput) {
                    callback();
                })
             };
            processItems(0);


    });

    /*  res.redirect('/Store' + base.router.getPattern('get.store.store_in'));*/
});

/**
 * post store in rejection
 */
router.post(base.router.getPattern('post.store.store_in_reject'), function (req, res, next) {


    let tempString = JSON.stringify(req.body);
    let transferId = parseInt(tempString.replace(/[:"{}]/g, ''));


    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.id = transferId;
    transferManagementSummaryModel.transferStatusId = 3;

    transferManagementSummaryQuery.responseToOrderRequests(transferManagementSummaryModel, function (output) {
        results = output;
        results.branchId = req.session.branch;
        results.transferId = req.query.id;
        res.redirect('/Store' + base.router.getPattern('get.store.store_in'));
    });


});

/**
 * search by barcode part
 */
router.get(base.router.getPattern('get.store.search_by_barcode_product_name'), function (req, res, next) {

    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');

    stores.state = req.query.state;
    stores.barcodePart = req.query.barcodePart;
    stores.productNamePart = req.query.productNamePart;
    if (isNaN(req.query.branchId)) {
        stores.branchId = req.session.branch;
    } else {
        stores.branchId = req.query.branchId;
    }
    stores.offset = req.query.offset;
    stores.limit = req.query.limit;

    storesQuery.filterStoresByBarcodeProductName(stores, function (output) {
        res.send(output);
    });
});

/**
 * search by barcode inactive part
 */
 router.get(base.router.getPattern('get.store.search_by_barcode_inactive_product_name'), function (req, res, next) {

    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');

    stores.state = req.query.state;
    stores.barcodePart = req.query.barcodePart;
    stores.productNamePart = req.query.productNamePart;
    if (isNaN(req.query.branchId)) {
        stores.branchId = req.session.branch;
    } else {
        stores.branchId = req.query.branchId;
    }
    stores.offset = req.query.offset;
    stores.limit = req.query.limit;

    storesQuery.filterStoresByBarcodeProductName(stores, function (output) {
        res.send(output);
    });
});

/**
 * search by barcode part one
 */
router.get(base.router.getPattern('get.store.search_by_barcode_product_name_one'), function (req, res, next) {
    
    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');

    let product = mysqlDB.getModel('product');
    let productQuery = mysqlDB.getQuery('product');

    stores.barcodePart = req.query.barcodePart;
    stores.productNamePart = req.query.productNamePart;
    stores.branchId = parseInt(req.query.branchId);

    product.barcodePart = req.query.barcodePart;
    product.productNamePart = req.query.productNamePart;

    let typeId = parseInt(req.query.typeId);

    if (typeId === 1 || typeId === 4) {
        //search one in product
        productQuery.filterProductByBarcodeProductNameOne(product, function (output) {
            console.log('product filter',output)
            let result = {};
            result.productInfo = output;
            console.log('result array ',result)
            if(output !==  null) {
                stores.productId = output.id;
                storesQuery.getByProductIdBranchId(stores, function (output1) {
                    if (output1 === null) {
                        result.qih = 0
                    } else {
                        result.qih = output1.qty;
                    }
                    res.send(result);
                    console.log('typeid result...',result)
                })
              
            }else{

                res.send(undefined);
            }
        })
    } else if (typeId === 2 || typeId === 3) {
        storesQuery.filterStoresByBarcodeProductNameOne(stores, function (output) {
            res.send(output);
        });
    } 
});

/**
 * search all products
 */
router.get(base.router.getPattern('get.store.search_in_all_branches'), function (req, res, next) {

    let stores = mysqlDB.getModel('stores');
    let storesQuery = mysqlDB.getQuery('stores');

    stores.barcodePart = req.query.barcodePart;
    stores.productNamePart = req.query.productNamePart;
    stores.branchId = parseInt(req.query.branchId);
    stores.offset = req.query.offset;
    stores.limit = req.query.limit;

    storesQuery.getAllStoreProducts(stores, function (output) {
        res.send(output);
    });

});

/**
 * render store transfer rejected list
 */
router.get(base.router.getPattern('get.store.store_transfer_reject'), function (req, res, next) {

    let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummaryModel.source = req.session.branch;
    transferManagementSummaryQuery.getStoreTransferReject(transferManagementSummaryModel, function (output) {
        output.branchId = req.session.branch;

        if (output !== undefined){
            let currentRoute = 'get.store.store_transfer_reject';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_store_transfer_reject', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });
        }else{
            res.send(500);
        }
    });

});

/**
 * delete all inactive products
 */
 router.post(base.router.getPattern('post.store.bulkdelete'),function(req,res,next){
    let product_ids = req.body.product_ids;
    let stores_query = mysqlDB.getQuery('stores');

    if (product_ids !== undefined){
        stores_query.bulkDeleteStores(product_ids,function(output){
            res.send (output);
        });
    } 
});

/**
 * delete all products in each store
 */
 router.post(base.router.getPattern('post.store.branchbulkdelete'),function(req,res,next){

    let stores_ids = req.body.product_ids;

    // Todo do bulk deletion
    let stores_query = mysqlDB.getQuery('stores');
    stores_query.branchBulkDeleteStores(stores_ids,function(output){
        res.send (output);
    });

});
/**
 * activate all products in each store
 */
 router.post(base.router.getPattern('post.store.branchactivate'),function(req,res,next){

    console.log('@controller store branch activate all products!!!')
    var stores_ids = req.body.product_ids;
    // console.log(product_ids);

    // Todo do bulk deletion
    var stores_query = mysqlDB.getQuery('stores');
    stores_query.branchBulkActivateStores(stores_ids,function(output){
        res.send (output);
    });
    
});
router.get(base.router.getPattern('get.store.storein_report_admin'), function (req, res, next) {
    console.log('storein report////////////')
    let branch = req.session.branch
    console.log('branch new-----------------',branch)
 
   var stores_query = mysqlDB.getQuery('stores');
   stores_query.storeinReportAdmin(function (output) {
       console.log('output//////////',output)
       let currentRoute = 'get.store.storein_report';
       let branch = JSON.stringify(imageConfig.images.branch.file)
       let profile = JSON.stringify(imageConfig.images.profile.file)
       let logo = JSON.stringify(imageConfig.images.logo.file)
       res.render('backend/store/manager_storein_report',{
           route: currentRoute,
           user: base.getCurrentUser(req),
           results:output,
           images: {branch: branch, profile: profile, logo: logo} 
        }
       );
   });
});
/**
 * render store transfer reject list
 */
router.get(base.router.getPattern('get.store.store_transfer_reject_list'), function (req, res, next) {

    let transferManagementInfoModel = mysqlDB.getModel('transfer_management_info');
    let transferManagementInfoQuery = mysqlDB.getQuery('transfer_management_info');

    transferManagementInfoModel.transferId = req.query.id;
    transferManagementInfoQuery.getByTransferId(transferManagementInfoModel, function (status,output) {

        output.branchId = req.session.branch;
        output.transferId = req.query.id;

        if (status){
            let currentRoute = 'get.store.store_transfer_reject_list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/store/manager_store_transfer_reject_list', {
                results: output,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo}
            });

        }else{
            res.send(output);
        }
        
    });

    
});
//manager store in report

router.get(base.router.getPattern('get.store.storein_report'), function (req, res, next) {
    console.log('storein report////////////')
    let branch = req.session.branch
    console.log('branch new-----------------',branch)
 
   var stores_query = mysqlDB.getQuery('stores');
   stores_query.storeinReport(branch,function (output) {
       console.log('output//////////',output)
       let currentRoute = 'get.store.storein_report';
       let branch = JSON.stringify(imageConfig.images.branch.file)
       let profile = JSON.stringify(imageConfig.images.profile.file)
       let logo = JSON.stringify(imageConfig.images.logo.file)
       res.render('backend/store/manager_storein_report',{
           route: currentRoute,
           user: base.getCurrentUser(req),
           results:output,
           images: {branch: branch, profile: profile, logo: logo} 
        }
       );
   });
});

router.post(base.router.getPattern('post.store.storein_report'), function(req, res, next) {
    var stores_query = mysqlDB.getQuery('stores');
    console.log('/////////////////////////////////////////data')
    console.log('get data in',req.body)
    console.log('/////////////////////////////////////////data')
    let id = req.body.id
    let accept = req.body.reacceptqty
    let reject = req.body.rerejected
    let error = req.body.errored
    console.log('new id',id)
    stores_query.getProductData(id,function (output) {
        console.log('new trafer product id and data...............',output)
        console.log('new trafer product id and data...............',output[0].product_id)
        let productId = output[0].product_id
        let branch = output[0].source
    stores_query.getStoresId(productId,branch,function (stores) {
        console.log("GET STORES ID",stores)
    let storesId = stores[0].id
    console.log("GET STORES ID",stores)
        stores_query.addToStore(accept,storesId,function (result) {
            console.log('store accepted resultss',result)
            stores_query.addToTransferInfo(accept,reject,error,id,function (result) {
                if(result){
                    res.send(200)
                }

            })
        })

    })
    })

});
module.exports = router;