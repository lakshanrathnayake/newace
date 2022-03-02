/**
 * Created by tharindu on 2/15/2018.
 */
const express = require("express");
const router = express.Router();
const mysqlDB = require("../models/mysql");
const syncLoop = require("sync-loop");
const base = require("./base")();
const userBranchQuery = mysqlDB.getQuery("branch");
const transferTypeQuery = mysqlDB.getQuery("transfer_type");
const imageConfig = require("../images.config.json");
const { result } = require("underscore");

/**
 * Add inventory first
 */
router.get(
  base.router.getPattern("get.inventory.add"),
  function (req, res, next) {
    let transferTypeQuery = mysqlDB.getQuery("transfer_type");
    let transferTypeModel = mysqlDB.getModel("transfer_type");

    let branchModel = mysqlDB.getModel("branch");
    let branchQuery = mysqlDB.getQuery("branch");

    let supplierModel = mysqlDB.getModel("supplier");
    let supplierQuery = mysqlDB.getQuery("supplier");

    supplierQuery.getAllSuppliers(supplierModel, function (supplierResult) {
      branchQuery.getAllBranches(branchModel, function (branchResult) {
        transferTypeQuery.getAllTransferTypes(
          transferTypeModel,
          function (transferTypeResult) {
            let profile = JSON.stringify(imageConfig.images.profile.file);
            let logo = JSON.stringify(imageConfig.images.logo.file);
            res.render("backend/inventory/manager_add_inventory", {
              route: "get.inventory.add",
              user: base.getCurrentUser(req),
              transferTypes: transferTypeResult,
              branches: branchResult,
              images: { profile: profile, logo: logo },
              suppliers: supplierResult,
              currentBranch: req.session.branch,
            });
          }
        );
      });
    });
  }
);

router.get(
  base.router.getPattern("get.inventory.filter"),
  function (req, res, next) {
    let branch = req.query.branchnew;
    let date = req.query.date;
    let type = req.query.type;

    let transferManagementSummaryQuery = mysqlDB.getQuery(
      "transfer_management_summary"
    );
    transferManagementSummaryQuery.getTransferSearchList(
      branch,
      type,
      date,
      function (newoutput) {
        console.log(newoutput);
        var response = {
          data: newoutput,
        };
        console.log(response);
        res.send(newoutput);
      }
    );
  }
);

/**
 * List inventory page
 */
//   router.post(base.router.getPattern('post.inventory.list'), function (req, res, next) {
//      let branch = req.body.branch;
//      let date = req.body.date;
//      let type = req.body.type;
//      console.log(branch)
//     // transferManagementSummaryQuery.getTransferSearchList(branch,type,date, function (newoutput) {

//     let transferManagementSummaryModel = mysqlDB.getModel('transfer_management_summary');
//     let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

//     transferManagementSummaryModel.typeId = null;
//     transferManagementSummaryModel.source = req.session.branch;
//       transferManagementSummaryModel.date = null;
//       transferManagementSummaryModel.offset = 0;
//       transferManagementSummaryModel.limit = 25;

//      //transferManagementSummaryQuery.getAllTransferListV2(transferManagementSummaryModel, {
//    //     offset: 0,    //    limit: 25
//    //  }, function (output) {
//     //     output.branchId = req.session.branch;
//      //    let currentRoute = 'get.inventory.list';

//     transferManagementSummaryQuery.getTransferSearchList(branch,type,date, function (newoutput) {
//         let currentRoute = 'post.inventory.list';
//         console.log('outpustt',newoutput)
//         userBranchQuery.getBranches(function (branchData) {
//             transferTypeQuery.getTransferTypes(function (transferData) {
//                 let profile = JSON.stringify(imageConfig.images.profile.file)
//               let logo = JSON.stringify(imageConfig.images.logo.file)
//                // let summary= JSON.parse(newoutput)
//                var A = newoutput;
//                var B = {};
//                var B = A[0];
//                console.log(B)
//                 //console.log("summary new route",summary)
//                 let grn = B.date
//                 console.log(grn)
//                 return res.render('backend/inventory/manager_inventory_list', {
//                     //results:summary,
//                     grn:grn,
//                     route: currentRoute,
//                     user: base.getCurrentUser(req),
//                     branches: branchData,
//                     images: {profile: profile, logo: logo},
//                     transfertypes: transferData
//                 });
//             });
//         });

//     })

// })
router.get(
  base.router.getPattern("get.inventory.list"),
  function (req, res, next) {
    let transferManagementSummaryModel = mysqlDB.getModel(
      "transfer_management_summary"
    );
    let transferManagementSummaryQuery = mysqlDB.getQuery(
      "transfer_management_summary"
    );

    transferManagementSummaryModel.typeId = null;
    transferManagementSummaryModel.source = req.session.branch;
    transferManagementSummaryModel.date = null;
    transferManagementSummaryModel.offset = 0;
    transferManagementSummaryModel.limit = 25;

    transferManagementSummaryQuery.getAllTransferListV2(
      transferManagementSummaryModel,
      {
        offset: 0,
        limit: 25,
      },
      function (output) {
        output.branchId = req.session.branch;
        let currentRoute = "get.inventory.list";

        userBranchQuery.getBranches(function (branchData) {
          transferTypeQuery.getTransferTypes(function (transferData) {
            let profile = JSON.stringify(imageConfig.images.profile.file);
            let logo = JSON.stringify(imageConfig.images.logo.file);

            console.log("output", output);

            return res.render("backend/inventory/manager_inventory_list", {
              results: JSON.parse(JSON.stringify(output)),
              //  results:newoutput,
              route: currentRoute,
              user: base.getCurrentUser(req),
              branches: branchData,
              images: { profile: profile, logo: logo },
              transfertypes: transferData,
            });
          });
        });
      }
    );
  }
);

/**
 * inventory info page
 */
router.get(
  base.router.getPattern("get.inventory.info"),
  function (req, res, next) {
    let transferManagementInfoModel = mysqlDB.getModel(
      "transfer_management_info"
    );
    let transferManagementInfoQuery = mysqlDB.getQuery(
      "transfer_management_info"
    );

    let transferSummaryModel = mysqlDB.getModel("transfer_management_summary");
    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");

    transferManagementInfoModel.transferId = req.query.id;
    transferSummaryModel.id = req.query.id;

    let results = {
      transferSummary: null,
      transferInfo: null,
    };

    transferSummaryQuery.getAllByTransferID(
      transferSummaryModel,
      function (output1) {
        results.transferSummary = output1;
        transferManagementInfoQuery.getByTransferId(
          transferManagementInfoModel,
          function (status, output2) {
            if (status) {
              results.transferInfo = output2;
              let profile = JSON.stringify(imageConfig.images.profile.file);
              let logo = JSON.stringify(imageConfig.images.logo.file);
              let currentRoute = "get.inventory.info";
              res.render("backend/inventory/manager_inventory_list_info", {
                results: results,
                route: currentRoute,
                images: { profile: profile, logo: logo },
                user: base.getCurrentUser(req),
              });
            } else {
              res.send(output2);
            }
          }
        );
      }
    );
  }
);

/**
 * add new transfer
 */
router.post(
  base.router.getPattern("post.inventory.post"),
  function (req, res, next) {
    let dataIn = req.body;

    let transferAll = {};
    let transferSummaryModel = mysqlDB.getModel("transfer_management_summary");
    transferSummaryModel.id = null;
    transferSummaryModel.source = req.session.branch;
    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");
    let transferInfoModel = mysqlDB.getModel("transfer_management_info");
    let transferInfoQuery = mysqlDB.getQuery("transfer_management_info");
    let storesModel = mysqlDB.getModel("stores");
    let storesQuery = mysqlDB.getQuery("stores");
    if (dataIn.transfer == "transfer") {
      for (let key in dataIn) {
        transferAll[key] = dataIn[key];
      }

      let transferSummary = (transferAll["formData"] + "").split("&");
      //    console.log('destination find.',transferSummary)
      transferSummary[3] = "typeId=2";

      const myArray = transferSummary[1].split("transferId=", 3);

      for (let i = 0; i < transferSummary.length; i++) {
        let t = transferSummary[i].split("=");

        if (isNaN(t[1])) {
          transferSummaryModel["" + t[0]] = t[1];
        } else {
          if (t[1] === "" || t[1] === undefined || t[1] == null) {
            transferSummaryModel["" + t[0]] = null;
          } else {
            transferSummaryModel["" + t[0]] = parseInt(t[1]);
          }
        }
      }
      // console.log('transfer summary model',transferSummaryModel.destination)
      let table_data1 = transferAll["tableData"];
      let array = [];
      for (let i = 0; i < table_data1.length; i++) {
        array.push(parseInt(table_data1[i].quantity));
      }
      console.log("my array results......", array);
      let i = 0;
      syncLoop(
        Object.keys(transferAll["tableData"]).length,
        function (loop) {
          addToStorenew(i, function () {
            i++;
            loop.next();
          });
        },
        function () {
          // res.send('Successful');
        }
      );
      let quantity1 = [];

      function addToStorenew(i, callback) {
        let destination = parseInt(transferSummaryModel.destination);
       
        let table_data = transferAll["tableData"];
        transferInfoModel.productId = parseInt(table_data[i].productid);
        storesQuery.getAllStoreQty(
          i,
          destination,
          transferInfoModel,
          function (storesOutput, error) {
      
            if (storesOutput) {
              quantity1.push(storesOutput[0].qty);
            } else {
              quantity1.push(0);
            }
            callback(i);
              console.log('quantity is new',quantity1)
            resultnew1 = [];

            for (var i = 0; i <= array.length - 1; i++) {
              resultnew1.push(parseInt(quantity1[i] - array[i]));
            }
            function filterArray(el) {
              return typeof el === "number" && !isNaN(el);
            }

            var resultnew1 = resultnew1.filter(filterArray);
            let hasOverQty = resultnew1.some((v) => v < 0);
           
            if (hasOverQty == false && resultnew1.length == array.length) {
              transferSummaryQuery.addTransferSummary(
                transferSummaryModel,
                function (summaryOutput) {
                  transferInfoModel.transferId = summaryOutput.id;
                  let i = 0;

                  syncLoop(
                    Object.keys(transferAll["tableData"]).length,
                    function (loop) {
                      addToStore(i, function () {
                        i++;
                        loop.next();
                      });
                    },
                    function () {
                      res.send("Successful");
                    }
                  );

                  function addToStore(i, callback) {
                    console.log("add to store");

                    let table_data = transferAll["tableData"];
                    transferInfoModel.productId = table_data[i].productid;
                    transferInfoModel.qty = table_data[i].quantity;
                    transferInfoModel.cost = table_data[i].linetotal;

                    storesModel.typeId = 2;
                    storesModel.source = summaryOutput.source;
                    storesModel.destination = summaryOutput.destination;
                    storesModel.state = 1;
                    storesModel.productId = parseInt(table_data[i].productid);
                    storesModel.qty = parseInt(table_data[i].quantity);
                    storesModel.branchId = req.session.branch;

                    //  console.log('/////////transfer ididid//////',summaryOutput.transferId)
                    storesQuery.updateStores(storesModel,function (storesOutput) {
                        if (storesOutput.id != null) {
                          let transferId = myArray[1];
                          transferInfoQuery.addTransferInfo(
                            transferInfoModel,
                            function (infoOutput) {
                              transferSummaryQuery.updateOrderRequest(
                                transferId,
                                function (output) {
                                  let transferIdNew = myArray[1];
                                }
                              );
                            }
                          );
                          callback();
                        } else {
                          transferSummaryQuery.delTransferSummary(
                            transferSummaryModel,
                            function (summaryOutput) {}
                          );
                          callback(500)
                        }

                        //  callback();
                      }
                    );
                  }
                }
              );
            } else if (hasOverQty == false) {
            } 
            else if( hasOverQty== true && resultnew1.length == array.length) {
              callback(error)
              res.send(500)
            }
          }
        );
      }
    } else {
      for (let key in dataIn) {
        transferAll[key] = dataIn[key];
      }

      let transferSummary = (transferAll["formData"] + "").split("&");
      for (let i = 0; i < transferSummary.length; i++) {
        let t = transferSummary[i].split("=");

        if (isNaN(t[1])) {
          transferSummaryModel["" + t[0]] = t[1];
        } else {
          if (t[1] === "" || t[1] === undefined || t[1] == null) {
            transferSummaryModel["" + t[0]] = null;
          } else {
            transferSummaryModel["" + t[0]] = parseInt(t[1]);
          }
        }
      }

      transferSummaryQuery.addTransferSummary(
        transferSummaryModel,
        function (summaryOutput) {
          transferInfoModel.transferId = summaryOutput.id;
          let i = 0;
          
          syncLoop(
            Object.keys(transferAll["tableData"]).length,
            function (loop) {
              addToStore(i, function () {
                i++;
                loop.next();
              });
            },
            function () {
              res.send("Successful");
            }
          );

          function addToStore(i, callback) {
         

            let table_data = transferAll["tableData"];
            transferInfoModel.productId = table_data[i].productid;
            transferInfoModel.qty = table_data[i].quantity;
            transferInfoModel.cost = table_data[i].linetotal;

            transferInfoQuery.addTransferInfo(
              transferInfoModel,
              function (infoOutput) {
                storesModel.typeId = summaryOutput.typeId;
                storesModel.source = summaryOutput.source;
                storesModel.destination = summaryOutput.destination;
                storesModel.state = 1;
                storesModel.productId = parseInt(table_data[i].productid);
                storesModel.qty = parseInt(table_data[i].quantity);
                storesModel.branchId = req.session.branch;

                storesQuery.updateStores(storesModel, function (storesOutput) {
                 

                  callback();
                });
              }
            );
          }
        }
      );
    }
  }
);
/**
 * add request transfer
 */
router.post(
  base.router.getPattern("post.requestinventory.post"),
  function (req, res, next) {
    let dataIn = req.body;
    let transferAll = {};
    let transferSummaryModel = mysqlDB.getModel("transfer_management_summary");
    transferSummaryModel.id = dataIn.orderRequestId;
    transferSummaryModel.transferStatusId = 1;
    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");
    let transferInfoModel = mysqlDB.getModel("transfer_management_info");
    let transferInfoQuery = mysqlDB.getQuery("transfer_management_info");
    let storesModel = mysqlDB.getModel("stores");
    let storesQuery = mysqlDB.getQuery("stores");

    for (let key in dataIn) {
      transferAll[key] = dataIn[key];
    }
    console.log("");
  }
);

/**
 * get all inventory ids  filtered with branch and type
 */
router.get(
  base.router.getPattern("get.inventory.id_by_branch_type"),
  function (req, res, next) {
    let branchId = parseInt(req.query.branchId);
    let typeId = parseInt(req.query.typeId);

    let transferSummaryModel = mysqlDB.getModel("transfer_management_summary");
    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");

    transferSummaryModel.typeId = typeId;
    transferSummaryModel.source = branchId;

    transferSummaryQuery.getByBranchIdTransferType(
      transferSummaryModel,
      function (output) {
        res.send(output);
      }
    );
  }
);

router.get(
  base.router.getPattern("get.inventory.info_by_id"),
  function (req, res, next) {
    let transferId = parseInt(req.query.transferId);
    let transferInfoModel = mysqlDB.getModel("transfer_management_info");
    let transferInfoQuery = mysqlDB.getQuery("transfer_management_info");
    let output = {
      transferSummary: null,
      transferInfo: null,
    };

    let transferSummaryModel = mysqlDB.getModel("transfer_management_summary");
    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");

    transferInfoModel.transferId = transferId;
    transferSummaryModel.id = transferId;

    transferSummaryQuery.getAllByTransferID(
      transferSummaryModel,
      function (output1) {
        output.transferSummary = output1;
        transferInfoQuery.getByTransferId(
          transferInfoModel,
          function (status, output2) {
            if (status) {
              output.transferInfo = output2;
              res.send(output);
            } else {
              res.send(output2);
            }
          }
        );
      }
    );
  }
);

/**
 *
 */
router.get(
  base.router.getPattern("get.inventory.id_by_branch_type_date"),
  function (req, res, next) {
    let source = req.query.source;
    let typeId = req.query.typeId;
    let date = req.query.date;

    let transferSummaryModel = mysqlDB.getModel("transfer_management_summary");
    let transferManagementInfo = mysqlDB.getModel("transfer_management_info");
    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");

    transferSummaryModel.typeId = typeId;
    transferSummaryModel.source = source;
    transferSummaryModel.date = date;
    transferSummaryModel.offset = parseInt(req.query.offset);
    transferSummaryModel.limit = parseInt(req.query.limit);

    transferSummaryQuery.getBybranchIdTransferTypeDate(
      transferSummaryModel,
      function (output) {
        addItemCount(output, function (result, count) {
          if (count === 0) {
            res.send(result);
          }
        });
      }
    );

    function addItemCount(summaryRecord, callback) {
      let result = [];
      let count = summaryRecord.length;
      summaryRecord.forEach((element) => {
        transferSummaryQuery.getTransferItemCount(
          transferManagementInfo,
          element.id,
          function (status, itemCount) {
            if (status) {
              element.dataValues.itemCount = itemCount;
            } else {
              element.dataValues.itemCount = 0;
            }
            result.push(element);
            count--;
            callback(result, count);
          }
        );
      });
    }
  }
);

router.get(
  base.router.getPattern("get.inventory.id_by_product_name_barcode"),
  function (req, res, next) {
    let productName = req.query.productName;

    let transferSummaryQuery = mysqlDB.getQuery("transfer_management_summary");

    transferSummaryQuery.getTransferSummariesByProductNameBarcode(
      productName,
      function (output) {
        res.send(output);
      }
    );
  }
);

module.exports = router;
