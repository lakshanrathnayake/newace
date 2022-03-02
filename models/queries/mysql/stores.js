const Base = require('./base');
const mysqlDB = require('../../mysql');
const config = require('../../../config.json');
const Sequelize = require('sequelize');
const sequelizeObject = new Sequelize({
    database: config.mysql.database,
    username: config.mysql.username,
    password: config.mysql.password,
    dialect: 'mysql',
    pool: {
        max: config.mysql.maxPoolSize,
        min: config.mysql.minPoolSize,
        acquire: 30000,
        idle: 1000
    },
    define: {
        timestamps: false
    }
});
const Op = Sequelize.Op

/**
 * User related queries
 * @param db
 * @constructor
 */
function Stores(db) {
    // inheritance management
    this.__proto__ = new Base('stores', db);


    this.findAllProducts = function (branch_id, callback) {
        let store = mysqlDB.getModel('stores');
        let product = mysqlDB.getModel('product');
        store.findAll({ where: { branchId: branch_id }, include: [{ model: product }] }).then(function (products) {
            callback(products);
        });
    };

    this.findAllByPage = function (branch_id, offset, callback) {
        let store = mysqlDB.getModel('stores');
        let product = mysqlDB.getModel('product');
        store.findAll({
            //attributes:['id','branch_id','product_id','qty'],
            where: { branchId: branch_id },
            include: [
                {
                    //attributes:['id','barcode','product_name','category_id','selling_price','image_url'],
                    model: product
                }
            ]
            , limit: 200, offset: (parseInt(offset) > 0) ? parseInt(offset) * 200 : 0
        }).then(function (products) {
            callback(products);
        });

    };

    this.searchProduct = function (branch_id, category, name, callback) {
        let store = mysqlDB.getModel('stores');
        let product = mysqlDB.getModel('product');
  
        store.findAll({
            //attributes:['id','branch_id','product_id','qty'],
            where: {
                branchId: branch_id
            },
            include: [
                {
                    //attributes:['id','barcode','product_name','category_id','selling_price','image_url'],
                    where: {
                        [Op.and]: [
                            (name != null) ? {
                                [Op.or]: [
                                    { barcode: { [Op.like]: '%' + name + '%' } },
                                    { product_name: { [Op.like]: '%' + name + '%' } }
                                ]
                            } : {},
                            (category == 0) ? {} : { category_id: category }
                        ]
                    },
                    model: product
                }
            ]
            , limit: 200, offset: 0
        }).then(function (products) {
            callback(products);
        });

    };

    /**
     * update stores when adding transfer record
     * @param model
     * @param callback
     */
    this.updateStores = function (model, callback) {
        let product = mysqlDB.getModel('product');
        let data = {
            branchId: model.source,
            productId: model.productId,
            qty: model.qty
        };
        if (model.typeId == 1) { // if store in
            model.branchId = model.source;
            //found for previous record
            model.findOne({ where: { branchId: model.source, productId: model.productId } }).then(function (returnedModel) {

                if (returnedModel != null) { // old record exists
                    returnedModel.increment('qty', { by: model.qty }).then(function (returnedModel) {
                        returnedModel.update({ state: 1 }).then(callback);
                    });
                } else { // if no previous record
                    product.findOne({
                        where: { id: model.productId },
                        attributes: ['reorder_level', 'min_order_quantity']
                    }).then(function (productModel) {

                        data['reorderLevel'] = productModel.dataValues.reorder_level;
                        data['minOrderQuantity'] = productModel.dataValues.min_order_quantity;
                        model.create(JSON.parse(JSON.stringify(data))).then(function (returnedModel) {
                            callback(returnedModel);
                        });

                    });


                }
            })
        } else if (model.typeId == 2 || model.typeId == 3) { //if store transfer or damage in
            model.branchId = model.source;
            model.findOne({ where: { branchId: model.source, productId: model.productId } }).then(function (returnedModel) {
                // old record exists

                returnedModel.decrement('qty', { by: model.qty }).then(function (returnedModel) {
                    callback(returnedModel);
                });


            }).catch(function (error) {
                callback(error)
            });
           
        } else { // if order request
            callback('order request');
        }
    };
    this.updateTransferConfirm = function (model, i, callback) {
      
        var product = mysqlDB.getModel('product');
       
        model.findOne({ where: { transferId: model.transferId, productId: model.productId } }).then(function (storesModel) {
           
            if (storesModel != null) {
                
                storesModel.increment('acceptedQty', { by: model.qty })
                storesModel.increment('rejectedQty', { by: model.reject })
                .then(function (returnModel) {
                    callback(returnModel);

                })
            } 
        })

          }

    /**
     * update stores on confirmation of store in record
     * @param model
     * @param i
     * @param callback
     */
    this.updateStoreTransferConfirm = function (model, i, callback) {

        var product = mysqlDB.getModel('product');
        //if first time  add
        model.findOne({ where: { branchId: model.branchId, productId: model.productId } }).then(function (storesModel) {
        //    console.log('stores model......',storesModel)
            if (storesModel != null) {
         //       console.log('////////////////////update stores//////////////////')
                storesModel.increment('qty', { by: model.qty }).then(function (returnModel) {
                    callback(returnModel);

                })
            } else {
            //    console.log('adding new product')
                product.findOne({
                    where: { id: model.productId },
                    attributes: ['reorder_level', 'min_order_quantity']
                }).then(function (productModel) {
                    model.reorderLevel = productModel.dataValues.reorder_level;
                    model.minOrderQuantity = productModel.dataValues.min_order_quantity;
                    model.id = null;

                    model.create(model).then(function (returnModel) {
                        callback(returnModel);
                    })
                });
            }
        })

        //else increase from destination & decrease from source

    }

    /**
     * update stores rol and moq
     * @param model
     * @param callback
     */
    this.updateStoresRolMoq = function (model, callback) {

        model.update({
            reorderLevel: model.reorderLevel,
            minOrderQuantity: model.minOrderQuantity,
            qty: model.qty
        }, { where: { id: model.id } }).then(function (output) {
            callback(output);
        })
    }

    /**
     * delete stores record; setting stores record state =0
     * @param branch
     * @param callback
     */
    this.deleteStores = function (stores, callback) {
        stores.update(stores, { where: { id: stores.id } }).then(function (returnModel) {
            callback(returnModel);
        });
    };

    /**
     * active stores record; setting stores record state =1
     * @param branch
     * @param callback
     */
     this.activeStores = function (stores, callback) {
        stores.update({ state:"1"}, { where: { id: stores.id } }).then(function (returnModel) {
            callback(returnModel);
        });
    };


    /**
     * bulk inactive items from stores table
     * @param {*} products 
     * @param {*} callback 
     */
    this.bulkDeleteStores = function (products, callback) {
        let store = mysqlDB.getModel('stores');
        store.update({ state:"0"}, {
            where: {
                id: {
                    [Op.or]: products
                }
            }
        }).then(function (returnModel) {
            callback(returnModel);
        }).catch(function (err) {
            console.log(err)
        });
    };

/**
 * branch bulk inactive items from stores table
 * @param {*} products 
 * @param {*} callback 
 */
        this.branchBulkDeleteStores = function (stores_ids, callback) {
        let store = mysqlDB.getModel('stores');

        store.update({ state:"0"}, {
            where: {
                productId: {
                    [Op.or]: stores_ids
                }
            }
        }).then(function (returnModel) {
            callback(returnModel);
        }).catch(function (err) {
            console.log(err)
        });
    };

/**
 * branch bulk active items from each stores 
 * @param {*} products 
 * @param {*} callback 
 */
 this.branchBulkActivateStores = function (stores_ids, callback) {
    let store = mysqlDB.getModel('stores');


    store.update({ state:"1"}, {
        where: {
            productId: {
                [Op.or]: stores_ids
            }
        }
    }).then(function (returnModel) {
        callback(returnModel);
    }).catch(function (err) {
        console.log(err)
    });
};



    /**
     * get stores info corresponding to branch
     * @param stores
     * @param callback
     */
    this.getStores = function (stores, callback) {
        stores.findAll({ where: { branchId: stores.branchId }, include: [{ all: true }] }).then(function (returnModel) {
            callback(returnModel);
        });
    };

    /**
     * get products less than rol
     * @param stores
     * @param callback
     */
    this.getOrderedProducts = function (stores, callback) {
        stores.findAll({
            where: {
                qty: { $lt: Sequelize.col('stores.reorder_level') },
                branchId: stores.branchId
            },
            include: [{ all: true }]
        }).then(function (returnModel) {
            callback(returnModel);
        });
    };

    /**
     * filter stores by barcode or product name
     * @param stores
     * @param callback
     */
    this.filterStoresByBarcodeProductName = function (stores, callback) {
        let product = mysqlDB.getModel('product')
        stores.findAll({
            where: { [Op.and]: [{ branchId: stores.branchId }, { state: stores.state }] },
            include: [{
                model: product, where: {
                    [Op.and]: [
                        {
                            barcode: {
                                [Op.like]: '%' + stores.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + stores.productNamePart + '%'
                            }
                        }
                    ]
                }
            }], limit: parseInt(stores.limit), order: [['id', 'DESC']], offset: parseInt(stores.offset)
        }).then(function (output) {
            callback(output);
        })

    }

     /**
     * filter stores by zero quantity for Admin
     * @param stores
     * @param callback
     */
      this.filterStoresByZeroQtyAdmin = function (stores, callback) {
        let product = mysqlDB.getModel('product')

        stores.findAll({
            where: { [Op.and]: [ { state: stores.state }, {qty: 0}] },
            include: [{
                model: product, where: {
                    [Op.and]: [
                        {
                            barcode: {
                                [Op.like]: '%' + stores.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + stores.productNamePart + '%'
                            }
                        }
                    ]
                }
            }],  order: [['id', 'DESC']], offset: parseInt(stores.offset)
        }).then(function (output) {
            callback(output);
        })

    }

      /**
     * filter stores by zero quantity for manager
     * @param stores
     * @param callback
     */
       this.filterStoresByZeroQtyManager = function (stores, callback) {
        let product = mysqlDB.getModel('product')

        stores.findAll({
            where: { [Op.and]: [{ branchId: stores.branchId }, { state: stores.state }, {qty: 0}] },
            include: [{
                model: product, where: {
                    [Op.and]: [
                        {
                            barcode: {
                                [Op.like]: '%' + stores.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + stores.productNamePart + '%'
                            }
                        }
                    ]
                }
            }],  order: [['id', 'DESC']], offset: parseInt(stores.offset)
        }).then(function (output) {

            callback(output);
        })

    }


    /**
     * filter stores by barcode or product name and one record only
     * @param stores
     * @param callback
     */
    this.filterStoresByBarcodeProductNameOne = function (stores, callback) {
        let product = mysqlDB.getModel('product')

        stores.findOne({
            where: { [Op.and]: [{ branchId: stores.branchId }, { state: 1 }] },
            include: [{
                model: product, where: {
                    [Op.or]: [
                        {
                            barcode: {
                                [Op.like]: '%' + stores.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + stores.productNamePart + '%'
                            }
                        }
                    ]
                }
            }]
        }).then(function (output) {
            callback(output);
        })

    }

    /**
     *
     * @param stores
     * @param callback
     */
    this.getAllStoreProducts = function (stores, callback) {
        sequelizeObject.query("SELECT r.product_id as id, SUM(`qty`) `qty`, product.barcode AS barcode, product.product_name as productName, product.reorder_level as reorderLevel, product.min_order_quantity as minOrderQuantity FROM Stores as r LEFT JOIN Product AS product ON r.product_id = product.id AND ( product.barcode LIKE '" + stores.barcodePart + "%' AND product.product_name LIKE '" + stores.productNamePart + "%') WHERE product.barcode != 'NULL' GROUP BY r.product_id LIMIT " + stores.offset + "," + stores.limit + " ", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    }
    this.getAllStoreQty = function (i,destination,model, callback) {
        sequelizeObject.query("SELECT CASE WHEN stores.qty > 0 THEN stores.qty ELSE 0 END AS qty FROM stores WHERE stores.branch_id ='"+destination+"' AND stores.product_id='"+model.productId+"'",
         {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        }).catch(function (error) {
            callback(false,error);
        });
    }


    /**
     * get stores record by stores record id
     * @param stores
     * @param callback
     */
    this.getByStoresId = function (stores, callback) {
        stores.findOne({ where: { id: stores.id }, include: [{ all: true }] }).then(function (returnModel) {
            callback(returnModel);
        })
    };

    /**
     * get product info by branch id  and product id
     * @param stores
     * @param callback
     */
    this.getByProductIdBranchId = function (stores, callback) {
        stores.findOne({ where: { branchId: stores.branchId, productId: stores.productId } }).then(function (returnModel) {
            callback(returnModel);
        })
    };


    this.qtyDecrement = function (branch_id, products) {
        let syncLoop = require('sync-loop');
        let stores = mysqlDB.getModel('stores');
        let i = 0;
        syncLoop(products.length, function (loop) {
            let index = loop.iteration(); // index of loop, value from 0 to (numberOfLoop - 1)
            stores.findOne({ where: { branchId: branch_id, productId: products[i].id } }).then(function (storeModel) {
                if (storeModel && storeModel != null) {
                    storeModel.decrement('qty', { by: products[i].qty });
                    i++;
                    loop.next();
                }
            })
        }, function () {
            console.log("This is finish function")
        });
    };

    this.qtyIncrement = function (branch_id, products) {
        let syncLoop = require('sync-loop');
        let stores = mysqlDB.getModel('stores');
        let i = 0;
        syncLoop(products.length, function (loop) {
            let index = loop.iteration(); // index of loop, value from 0 to (numberOfLoop - 1)
            stores.findOne({ where: { branchId: branch_id, productId: products[i].id } }).then(function (storeModel) {
                if (storeModel && storeModel != null) {
                    storeModel.increment('qty', { by: products[i].qty });
                    i++;
                    loop.next();
                }
            })
        }, function () {
            console.log("This is finish function")
        });
    };
    //storein report
    this.storeinReport = function (branch,callback) {
        console.log('sotrein report db part')
       sequelizeObject
         .query( "SELECT transfer_management_summary.grn_no, CAST(transfer_management_summary.date as date) AS date , transfer_management_info.id AS id,\n" +
         "transfer_management_info.qty AS sent_qty , transfer_management_info.rejected_qty as rejected_qty,\n" + 
         "b.branch_name AS destination, product.description, product.barcode\n" +
         "FROM transfer_management_summary \n" + 
         "left JOIN transfer_management_info ON transfer_management_summary.id = transfer_management_info.transfer_id \n" +
         "left JOIN branch b ON transfer_management_summary.destination =b.id \n" +
         "left JOIN product ON transfer_management_info.product_id = product.id \n" +
         "WHERE transfer_management_summary.type_id =2 AND transfer_management_info.rejection_state=0 AND transfer_management_info.rejected_qty >0 AND transfer_management_summary.source ='"+branch+"'" ,
    //    "GROUP BY transfer_management_summary.id",
            
           {
             type: Sequelize.QueryTypes.SELECT,
           }
         )  .then(function(output){
           callback(output)
       }).catch(function (err){
           callback(err)
       })
    }
    this.storeinReportAdmin = function (callback) {
        console.log('sotrein report db part')
       sequelizeObject
         .query( "SELECT transfer_management_summary.grn_no, CAST(transfer_management_summary.date as date) AS date , transfer_management_info.id AS id,\n" +
         "transfer_management_info.qty AS sent_qty , transfer_management_info.rejected_qty as rejected_qty,\n" + 
         "b.branch_name AS destination, product.description, product.barcode\n" +
         "FROM transfer_management_summary \n" + 
         "left JOIN transfer_management_info ON transfer_management_summary.id = transfer_management_info.transfer_id \n" +
         "left JOIN branch b ON transfer_management_summary.destination =b.id \n" +
         "left JOIN product ON transfer_management_info.product_id = product.id \n" +
         "WHERE transfer_management_summary.type_id =2 AND transfer_management_info.rejection_state=0 AND transfer_management_info.rejected_qty >0",
    //    "GROUP BY transfer_management_summary.id",
            
           {
             type: Sequelize.QueryTypes.SELECT,
           }
         )  .then(function(output){
           callback(output)
       }).catch(function (err){
           callback(err)
       })
    }

    this.getProductData = function (id,callback) {
        console.log('sotrein report db part')
       sequelizeObject
         .query("SELECT transfer_management_info.product_id , transfer_management_summary.source \n" +
         "FROM transfer_management_info\n" +
         "JOIN transfer_management_summary on transfer_management_summary.id = transfer_management_info.transfer_id\n" +
         "WHERE transfer_management_info.id ='"+id+"'" ,
            
           {
             type: Sequelize.QueryTypes.SELECT,
           }
         )  .then(function(output){
           callback(output)
       }).catch(function (err){
           callback(err)
       })
    }

    this.getStoresId = function (productId,branch,callback) {
        console.log('sotrein report db part')
       sequelizeObject
         .query("SELECT stores.id FROM stores WHERE stores.product_id  ='"+productId+"' AND stores.branch_id  ='"+branch+"'" ,
   
            
           {
             type: Sequelize.QueryTypes.SELECT,
           }
         )  .then(function(output){
           callback(output)
       }).catch(function (err){
           callback(err)
       })
    }

    this.addToStore = function (accept,storesId,callback) {
        console.log('sotrein report db part')
       sequelizeObject
         .query("UPDATE stores SET stores.qty = stores.qty+'"+accept+"' WHERE stores.id ='"+storesId+"'" ,
   
            
           {
             type: Sequelize.QueryTypes.UPDATE,
           }
         )  .then(function(output){
           callback(output)
       }).catch(function (err){
           callback(err)
       })
    }
    
    this.addToTransferInfo = function (accept,reject,error,id,callback) {
        console.log('sotrein report db part')
       sequelizeObject
         .query(
         "UPDATE transfer_management_info  \n" +
         "SET transfer_management_info.rejection_state=1, transfer_management_info.reaccepted_qty  ='"+accept+"'  , transfer_management_info.rerejected_qty ='"+reject+"' , transfer_management_info.errored_qty ='"+error+"'  \n" +
         "WHERE transfer_management_info.id ='"+id+"'" ,
   
            
           {
             type: Sequelize.QueryTypes.UPDATE,
           }
         )  .then(function(output){
           callback(output)
       }).catch(function (err){
           callback(err)
       })
    }

    // returning the object
    return this;
}
module.exports = Stores;