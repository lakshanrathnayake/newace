
const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op


function bill_payment_info(db) {
    // inheritance management
    this.__proto__ = new Base('bill_payment_info', db);

    let bill_payment_method = mysqlDB.getModel('bill_payment_method');

    this.findCashPayments = function(session_id,callback){
        let bill_payment = mysqlDB.getModel('bill_payment_info');
        let bill_summary = mysqlDB.getModel('bill_summary');

        bill_payment.findAll({
            where: { paymentMethodId:1 },
            include: [
                {
                    model: bill_summary,
                    where: {'sessionId':  parseInt(session_id)}
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.findAllPayments = function(session_id,callback){
        let bill_payment = mysqlDB.getModel('bill_payment_info');
        let bill_summary = mysqlDB.getModel('bill_summary');

        bill_payment.findAll({
            include: [
                {
                    model: bill_summary,
                    where: {'sessionId':  parseInt(session_id)}
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.addNewPayment = function (payment, callback) {
        let paymentModel = mysqlDB.getModel('bill_payment_info');
        paymentModel.bulkCreate(payment).then((Payment) => {
            callback(Payment,null);
        }).catch(function (err) {
            callback([],err);
        });
    };

    this.findPaymentByBill = function(bill_id,callback){
        let sessionModel = mysqlDB.getModel('bill_payment_info');
        sessionModel.findAll({
            where: {billId:parseInt(bill_id)},
            include: [
                {
                    model: bill_payment_method
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.findPaymentsForAnalysis = function(attr,callback){
        let from = new Date(attr.from);
        let end = new Date(attr.end);
        end = new Date(end.setHours(23, 59, 59, 999));
        from = new Date(from.setHours(0, 0, 0, 0));
        let paymentModel = mysqlDB.getModel('bill_payment_info');
        let bill_summary = mysqlDB.getModel('bill_summary');
        let user = mysqlDB.getModel('user');
        paymentModel.findAll({
            include:[
                {
                    model: bill_summary,
                    attributes : ['id','branch_id','cashier_id'],
                    where:(from && from != null && end && end != null) ?{
                        [Op.and] : [
                            {
                                date : {
                                    [Op.and] : [
                                        { [Op.gte] : from },
                                        { [Op.lte] : end  }
                                    ]
                                }
                            },
                            (attr.branch_id && attr.branch_id != null)?{branch_id:attr.branch_id}:{},
                            (attr.cashiers && attr.cashiers != null)?{cashier_id:attr.cashiers}:{}
                        ]
                    } : {},
                    include:[
                        {
                            model: user,
                            attributes : ['id','username']
                        }
                    ]
                }
            ]
        }).then(function(payments){
            callback(payments);
        });
    };
    return this;
}
module.exports = bill_payment_info;

/**
 * sample code goes here
 *
 */




