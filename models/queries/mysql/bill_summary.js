const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const syncLoop = require('sync-loop');


function bill_summary(db) {
    // inheritance management
    this.__proto__ = new Base('bill_summary', db);

    let bill_status = mysqlDB.getModel('bill_status');
    let user = mysqlDB.getModel('user');
    let bill = mysqlDB.getModel('bill_summary');
    let bill_payment_info = mysqlDB.getModel('bill_payment_info');
    let customer = mysqlDB.getModel('customer');

      //This function is used
    this.filterForAnalysis = function (attr, callback) {
       // console.log("attr in 1st query",attr);
        let from = new Date(attr.from);
        let end = new Date(attr.end);
        end = new Date(end.setHours(23, 59, 59, 999));
        from = new Date(from.setHours(0, 0, 0, 0));

        bill.findAll({
            where: {
                [Op.and]: [
                    (attr.branch_id && attr.branch_id != null) ? {
                        branch_id: parseInt(attr.branch_id)
                    } : {},
                    (attr.from && attr.from != null && attr.end && attr.end != null) ? {
                        date: {
                            [Op.and]: [
                                {[Op.gte]: from},
                                {[Op.lte]: end}
                            ]
                        }
                    } : {}
                ]
            },
            include: (attr.include) ? attr.include : [
                {
                    model: user,
                    where: {
                        [Op.and]: [
                            (attr.name && attr.name != null) ? {
                                username: {[Op.like]: '%' + attr.name + '%'}
                            } : {}
                        ]
                    },
                }
            ],
            attributes: attr.bill_attributes
        }).then(function (results) {
            //console.log("Bill Summary",results)
            return callback(results);
        }).catch(function (error) {
            console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
            console.log(error)
            return callback(error);
        });
    };
    //
    this.findByDate = function (attr, callback) {

        bill.findAll({
            where: (attr.flag == 'dis') ? {
                [Op.and]: [
                    {
                        date: {
                            [Op.lte]: attr.end
                        }

                    },
                    {
                        date: {
                            [Op.gte]: attr.from
                        }
                    }
                ]

            } : (attr.flag == 'ret') ? {
                date: {
                    [Op.lte]: attr.date
                }
            } : {},
            attributes: attr.attributes
        }).then(function (output) {
            var results;
            if (output && output != null) {
                results = [];
                output.map(function (x) {
                   // console.log(x.id);
                    results.push(x.id);
                });
            }
            else {
                results = [];
            }
            while (results === undefined) {
                require('deasync').runLoopOnce();
            }
           // console.log(results);
            callback(results);
        })
    };

    this.addNewBill = function (bill_new, callback) {
        //var billModel = mysqlDB.getModel('bill_summary');
       // console.log(bill_new);
        bill.create(bill_new).then((Session) => {
            callback(Session, null);
        }).catch(function (err) {
            console.log(err);
            callback(null, err);
        });
    };

    this.findOneBill = function (bill_id, branch_id, callback) {
        //var sessionModel = mysqlDB.getModel('bill_summary');
        bill.findOne({
            where: {billNo: bill_id, branch_id: parseInt(branch_id)},
            include: [
                {
                    model: bill_status
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };


    this.updateBill = function (attr, callback) {
        this.findOneSession(attr.session_id, attr.cashier_id, function (session) {
            if (session && session != null) {
                session.update(attr.up).then(function (returnModel) {
                    callback(returnModel);
                });
            }
            else {
                callback(null);
            }
        });

    };

    this.addCustomerToBill = function (attr, callback) {

        customer.findOne({
            where: {loyaltyReference: attr.loyaltyReference},

        }).then(function (customerResult) {

            bill.update(
                {customer_id: customerResult.dataValues.id},
                {where: {id: attr.billId}})

                .then(function () {

                    callback({status: 200});


                }).catch(function (e) {
                callback({status: 400});
            })
        }).catch(function (e) {
            callback({status: 400})
        })

    };
    // returning the object
    return this;
}
module.exports = bill_summary;

/**
 * sample code goes here
 *
 */




