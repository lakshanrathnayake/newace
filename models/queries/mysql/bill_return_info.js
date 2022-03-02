
const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op


function bill_return_info(db) {
    // inheritance management
    this.__proto__ = new Base('bill_item_info', db);

    //var session_status = mysqlDB.getModel('session_status');
    let return_item = mysqlDB.getModel('bill_item_info');
    let product = mysqlDB.getModel('product');
    let sessionModel = mysqlDB.getModel('bill_return_info');
    let bill = mysqlDB.getModel('bill_summary');


    //This fuction is used
    this.findReturnItems = function(bill_ids,end,callback){
        var end = new Date(end);
        end = new Date(end.setHours(23, 59, 59, 999));
        sessionModel.findAll({
            where: {'billItemId': {$in: bill_ids}},
            include: [
                {
                    attributes : ['id','productId','unitPrice','discount','taxes'],
                    model: return_item,
                    include: [
                        {
                            attributes : ['id','categoryId','productName'],
                            model: product
                        },
                        {
                            model: bill,
                            where : (end && end != null) ?{
                                date : {
                                    [Op.lte] : end
                                }
                            } : {}
                        }
                    ]
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.findProductsByBillItemIds = function(bill_ids,callback){

        sessionModel.findAll({
            where: {'billItemId': {$in: bill_ids}},
            include: [
                {
                    attributes : ['id','productId','unitPrice','discount','taxes'],
                    model: return_item,
                    include: [
                        {
                            attributes : ['id','categoryId'],
                            model: product
                        }
                    ]
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };


    this.findProductsByNewBillId = function(bill_id,callback){
     
        sessionModel.findAll({
            where: {'newBillId': bill_id},
            include: [
                {
                    attributes : ['id','productId','unitPrice','discount','taxes'],
                    model: return_item,
                    include: [
                        {
                            attributes : ['id','categoryId','productName'],
                            model: product
                        }
                    ]
                },
                {
                    attributes : ['sellingPrice','categoryId','productName'],
                    model: product
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.addReturnItems = function (items, callback) {
        let itemModel = mysqlDB.getModel('bill_return_info');
        itemModel.bulkCreate(items).then((updated) => { // Notice: There are no arguments here, as of right now you'll have to...
            callback(updated,null);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };

    // returning the object
    return this;
}
module.exports = bill_return_info;

/**
 * sample code goes here
 *
 */




