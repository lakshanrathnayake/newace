/**
 * Created by Shashika on 2/13/2018.
 */
const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const path = require('path');
const expres = require('express');

const Op = Sequelize.Op

/**
 * User related queries
 * @param db
 * @constructor
 */
function Product(db) {
    // inheritance management
    this.__proto__ = new Base('product', db);

    this.bulkAdd = function (products, callback) {
        let productModel = mysqlDB.getModel('product');
        productModel.bulkCreate(products).then((products) => { // Notice: There are no arguments here, as of right now you'll have to...
            callback(products,null);
        }).catch(function (err) {
            callback([],err);
        });
    };

    /**
     * filter products by barcode or product name and one record only
     * @param products
     * @param callback
     */
    this.filterProductByBarcodeProductNameOne = function (products, callback) {

        products.findOne({
            where: {
                [Op.and]: [{
                    [Op.or]: [
                        {
                            barcode: {
                                [Op.like]: '%' + products.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + products.productNamePart + '%'
                            }
                        }
                    ]
                }, {state: 1}]
            }

        }).then(function (output) {
            callback(output);
        })

    };


    /**
     * filter products by barcode or product name and all records
     * @param products
     * @param callback
     */
    this.filterProductByBarcodeProductName = function (products, callback) {

        let category = mysqlDB.getModel('category');
        products.findAll({
            where: {
                [Op.and]: [{
                    [Op.and]: [
                        {
                            barcode: {
                                [Op.like]: '%' + products.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + products.productNamePart + '%'
                            }
                        },


                    ]
                }, {state: 1}]
            },  include: [
                {
                    model: category, where: {
                    name: {
                        [Op.like]: '%' + products.categoryNamePart + '%'
                    }
                }
                }
            ]
            , limit: parseInt(products.limit),order:[['id','DESC']], offset: parseInt(products.offset)

        }).then(function (output) {
            callback(output);
        })

    };

    /**
     * filter inactive products by barcode or product name and all records
     * @param products
     * @param callback
     */
     this.filterProductByBarcodeInactiveProductName = function (products, callback) {

        let category = mysqlDB.getModel('category');
        products.findAll({
            where: {
                [Op.and]: [{
                    [Op.and]: [
                        {
                            barcode: {
                                [Op.like]: '%' + products.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + products.productNamePart + '%'
                            }
                        },


                    ]
                }, {state: 0}]
            },  include: [
                {
                    model: category, where: {
                    name: {
                        [Op.like]: '%' + products.categoryNamePart + '%'
                    }
                }
                }
            ]
            , limit: parseInt(products.limit),order:[['id','DESC']], offset: parseInt(products.offset)

        }).then(function (output) {
            callback(output);
        })

    };



    /**
     * filter products by barcode or product name and all records
     * @param products
     * @param callback
     */
     this.filterProductByBarcodeProductNameInactive = function (products, callback) {

        var category = mysqlDB.getModel('category');
        products.findAll({
            where: {
                [Op.and]: [{
                    [Op.and]: [
                        {
                            barcode: {
                                [Op.like]: '%' + products.barcodePart + '%'
                            }
                        },
                        {
                            productName: {
                                [Op.like]: '%' + products.productNamePart + '%'
                            }
                        },


                    ]
                }, {state: 0}]
                

            },  include: [
                {
                    model: category, where: {
                    name: {
                        [Op.like]: '%' + products.categoryNamePart + '%'
                    }
                }
                }
            ]
            , limit: parseInt(products.limit),order:[['id','DESC']], offset: parseInt(products.offset)

        }).then(function (output) {
            callback(output);
            
        })

    };


    /**
     * delete product query
     * @param product
     * @param callback
     */
    this.deleteProduct = function (product, callback) {
        product.update(product, {where: {id: product.id}}).then(function (product) {
            callback(product);
        });
    };


    /**
     * activate product query
     * @param product
     * @param callback
     */
    this.activateProduct = function (product, callback) {
        product.update(product, {where: {id: product.id}}).then(function (product) {
            callback(product);
        });
    };
    
    /**
     * bulk inactive items from product table
     * @param {*} products 
     * @param {*} callback 
     */
    this.bulkDeleteProducts = function (products, callback) {
        let product = mysqlDB.getModel('product');
        product.update({ statusId : "3" ,  state : "0"}, {
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
    }


    /**
     * update supplier
     * @param supplier
     * @param callback
     */

    this.updateProduct = function (supplier, callback) {
        supplier.update(supplier, {where: {id: supplier.id}}).then(function (returnModel) {
            callback(returnModel);
        });
    }
    // returning the object
    return this;
}
module.exports = Product;

/**
 * sample code goes here
 *
 */




