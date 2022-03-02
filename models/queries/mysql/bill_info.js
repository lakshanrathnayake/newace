const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op


function bill_info(db) {

    // inheritance management
    this.__proto__ = new Base('bill_item_info', db);

    //var session_status = mysqlDB.getModel('session_status');
    let product = mysqlDB.getModel('product');
    let bill_item_info_model = mysqlDB.getModel('bill_item_info');
    let bill = mysqlDB.getModel('bill_summary');


    //This function is used
    this.findItemsByBillId = function (bill_ids, from, end, callback) {

        // console.log("bill_ids",bill_ids)

        var from = new Date(from);
        var end = new Date(end);
        //  console.log("from :" +from +"to : "+end)
        end = new Date(end.setHours(23, 59, 59, 999));
        from = new Date(from.setHours(0, 0, 0, 0));
        // console.log("fromcccccc :" +from.toISOString() +"to : "+end.toISOString())

        bill_item_info_model.findAll({
            where: {'billId': bill_ids},
            include: [
                {
                    attributes: ['id', 'categoryId', 'productName'],
                    model: product
                },
                {
                    model: bill,
                    where: (from && from != null && end && end != null) ? {
                        date: {
                            [Op.and]: [
                                {[Op.gte]: from.toISOString()},
                                {[Op.lte]: end.toISOString()}
                            ]
                        }
                    } : {}
                }
            ]
        }).then(function (output) {
            // console.log("output", JSON.stringify(output))

            callback(output);
        })
    };


    this.salesReport = function (query, callback) {


        mysqlDB.getsequelizeObject().query(query).then(([results, metadata]) => {

            callback(results)

        }).catch((error) => {
            console.log("error", error);
        })


    }

    this.findAllItems = function (bill_id, callback) {
        var session = mysqlDB.getModel('bill_item_info');

        session.findAll({
            where: {billId: parseInt(bill_id)},
            include: [
                {
                    attributes: ['id', 'productName'],
                    model: product
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.addItems = function (items, callback) {
        let itemModel = mysqlDB.getModel('bill_item_info');
        itemModel.bulkCreate(items).then((updated) => { // Notice: There are no arguments here, as of right now you'll have to...
            callback(updated, null);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([], err);
        });
    };

    this.findProductsByBillId = function (bill_ids, callback) {

        bill_item_info_model.findAll({
            where: {'billId': {$in: bill_ids}},
            include: [
                {
                    attributes: ['id', 'categoryId'],
                    model: product
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };


    this.updateProduct = function (attr, callback) {
        this.findOneSession(attr.session_id, attr.cashier_id, function (session) {
            if (session && session != null) {
                session.update(attr.up).then(function (returnModel) {
                    callback(returnModel);
                });
            } else {
                callback(null);
            }
        });

    };

    this.findAllSessionBillItemInfo = function (session_id, cashier_id, callback) {
        bill_item_info_model.findAll({
            where: {'state': 1},
            include: [
                {
                    where: {cashier_id: parseInt(cashier_id), session_id: parseInt(session_id)},
                    attributes: ['id'],
                    model: bill
                }
            ]
        }).then(function (output) {
            if (output) {
                callback(true, output);
            } else {
                callback(false, 0);
            }

        })

    };


    this.findAllSessionBillTotal = function (session_id, cashier_id, callback) {

        bill_item_info_model.findAll({
            attributes: [[Sequelize.fn('sum', Sequelize.col('unit_price')), 'total']],
            where: {'state': 1},
            group: ["bill_id"],
            include: [
                {
                    where: {cashier_id: parseInt(cashier_id), session_id: parseInt(session_id)},
                    attributes: ['id', 'discount', 'discount_type'],
                    model: bill
                }
            ]
        }).then(function (output) {
            if (output) {
                callback(true, output);
            } else {
                callback(false, 0);
            }

        });
    };

    this.totalBillAmountForDiscount = function (bill_id, callback) {

        bill_item_info_model.findAll({
            attributes: [[Sequelize.fn('sum', Sequelize.col('unit_price')), 'total']],
            where: {'state': 1, 'bill_id': bill_id},
            include: [
                {
                    where: {id: bill_id},
                    attributes: ['id', 'discount', 'discount_type'],
                    model: bill
                }
            ]
        }).then(function (output) {
            console.log(output);
            if (output) {
                callback(true, output);
            } else {
                callback(false, 0);
            }

        }).catch(function (error) {
            callback(false, error)
        });
    };

    this.findAllBillitems = function (bill_id, callback) {
        bill_item_info_model.findAll({
            where: {'state': 1, 'bill_id': bill_id}
        }).then(function (output) {
            if (output) {
                callback(true, output);
            } else {
                callback(false, 0);
            }

        })

    };


    this.countItemsBySession = function (session_id, cashier_id, callback) {
        bill_item_info_model.sum('qty', {
            where: {'state': 1},
            include: [
                {
                    where: {cashier_id: parseInt(cashier_id), session_id: parseInt(session_id)},
                    attributes: ['id'],
                    model: bill
                }
            ]
        }).then(function (output) {
            if (output) {
                callback(true, output);
            } else {
                callback(false, 0);
            }

        });
    };
    // returning the object
    return this;
}

module.exports = bill_info;

/**
 * sample code goes here
 *
 */




