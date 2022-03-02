/**
 * Created by hariharan on 4/16/18.
 */
const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const sessionQuery = mysqlDB.getQuery('pos_session');
const billQuery = mysqlDB.getQuery('bill_summary');
const billInfoQuery = mysqlDB.getQuery('bill_info');
const returnItemsQuery = mysqlDB.getQuery('bill_return_info');
const imageConfig = require('../images.config.json');

/**
 * home page
 */
router.get(base.router.getPattern('get.pos.bill_controller'), function (req, res, next) {
    let bills = [];
    req.query.state = 1;
    base.listFilter('Branch', req, ['branchName', 'state', 'type'], function (list) {
        if (list !== undefined) {
            let currentRoute = 'get.pos.bill_controller';

            let branch = JSON.stringify(imageConfig.images.branch.file)
            let profile = JSON.stringify(imageConfig.images.profile.file)
            let logo = JSON.stringify(imageConfig.images.logo.file)

            res.render('backend/order_analysis/bill_controller', {
                branches: JSON.parse(JSON.stringify(list)),
                route: currentRoute,
                user: base.getCurrentUser(req),
                bills: JSON.parse(JSON.stringify(bills)),
                images: {branch: branch, profile: profile, logo: logo}

            });

        } else {
            res.send(500);

        }
    });


});

/**
 * load available bills
 */
router.post(base.router.getPattern('get.pos.bill_controller') + '/load_bills', function (req, res, next) {
    let bills = [];
    let date = new Date(req.body.from);

    billQuery.filterForAnalysis({
        flag: 'dis',
        branch_id: parseInt(req.body.branch_id),
        end: new Date(date.setHours(23, 59, 59, 999)),
        from: new Date(date.setHours(0, 0, 0, 0)),
        bill_attributes: ['id', 'billNo', 'date', 'cashier_id', 'sessionId', 'branch_id', 'billStatusId', 'expiry'],
        include: [
            {
                model: mysqlDB.getModel('user'),
                attributes: ['id', 'username']
            },
            {
                model: mysqlDB.getModel('customer'),
                attributes: ['id', 'customerName']
            },
            {
                model: mysqlDB.getModel('branch'),
                attributes: ['id', 'branchName', 'address']
            },
            {
                model: mysqlDB.getModel('bill_status'),
                attributes: ['id', 'name', 'code']
            },

            {
                model: mysqlDB.getModel('bill_payment_info'),
                attributes: ['id', 'amount'],
                include: [
                    {
                        model: mysqlDB.getModel('bill_payment_method'),
                        attributes: ['id', 'name', 'code']
                    }
                ]
            }
        ]
    }, function (results) {
        if (results != null && results) {
            bills = results;
        }
        res.send(JSON.parse(JSON.stringify(bills)));
    });
});


/**
 * view session
 */
router.post(base.router.getPattern('get.pos.bill_controller') + '/session', function (req, res, next) {
    let ses_id = req.body.ses_id;
    sessionQuery.findSessionById(ses_id, function (session) {
        let response = {status: 500};
        if (session != null && session) {
            response.status = 200;
            response.session = JSON.parse(JSON.stringify(session));
        }
        res.send(response);
    });
});

/**
 * change session
 */
router.post(base.router.getPattern('get.pos.bill_controller') + '/change_session', function (req, res, next) {
    let ses_id = req.body.ses_id;
    let status = req.body.status;
    sessionQuery.findSessionById(ses_id, function (session) {
        let response = {status: 500};
        if (session != null && session) {
            session.update({statusId: parseInt(status)}).then(function (updated) {
                if (updated != null && updated) {
                    response.status = 200;
                    response.updated = JSON.parse(JSON.stringify(updated));
                }
                res.send(response);
            });
        } else {
            res.send(response);
        }

    });
});

/**
 * get bill info
 */
router.post(base.router.getPattern('get.pos.bill_controller') + '/get_bill', function (req, res, next) {
    let bill_id = req.body.bill_id;
    let discount = 0;
    let response = {
        status: 500,
        discount: 0
    };
    let bill_payment_method = mysqlDB.getModel('bill_payment_method');
    let bill_payment = mysqlDB.getModel('bill_payment_info');

    billInfoQuery.findAllBillitems(bill_id, function (status3, billItemInfo) {
        if (status3) {
            billItemInfo.forEach(billItem => {
                discount = discount + (billItem.dataValues.unitPrice * billItem.dataValues.discount / 100);
            });
            response.discount = discount;
        }

    });

    billInfoQuery.totalBillAmountForDiscount(bill_id, function (status2, bill) {
        if (status2) {
            if (bill[0].dataValues.bill_summary.discount_type === "Rs") {
                discount = discount + bill[0].dataValues.bill_summary.dataValues.discount;
            } else {
                discount = discount + (bill[0].dataValues.total * bill[0].dataValues.bill_summary.dataValues.discount / 100)
            }
            response.discount = discount;
        }

    });


    bill_payment.findAll({
        where: {billId: parseInt(bill_id)},
        include: [{model: bill_payment_method}]
    }).then(function (payment) {
        response.payments = JSON.parse(JSON.stringify(payment));
        billInfoQuery.findAllItems(bill_id, function (bill_items) {
            response.items = JSON.parse(JSON.stringify(bill_items));
            returnItemsQuery.findProductsByNewBillId(bill_id, function (return_items) {
                response.return_items = JSON.parse(JSON.stringify(return_items));
                response.status = 200;
                res.send(response);
            });
        });
    }).catch(function () {
        res.send(response);
    });
});

/**
 * bill delete
 */
router.post(base.router.getPattern('get.pos.bill_controller') + '/delete_bill', function (req, res, next) {
    let bill_id = req.body.bill_id;
    let response = {
        status: 500
    };
    let bill_payment_method = mysqlDB.getModel('bill_payment_method');
    let bill_payment = mysqlDB.getModel('bill_payment_info');
    let bill_summary = mysqlDB.getModel('bill_summary');
    bill_summary.findOne({where: {id: parseInt(bill_id)}}).then(function (bill) {
        if (bill != null && bill) {
            bill_payment.findAll({
                where: {billId: parseInt(bill_id)},
                include: [{model: bill_payment_method}]
            }).then(function (payment) {
                for (let i = 0; i < payment.length; i++) {
                    payment[i].destroy();
                }
                billInfoQuery.findAllItems(bill_id, function (bill_items) {
                    for (i = 0; i < bill_items.length; i++) {
                        bill_items[i].destroy();
                    }
                    bill.destroy();
                    response.status = 200;
                    res.send(response);
                });
            }).catch(function (e) {
                res.send(response);
            });
        } else {
            res.send(response);
        }
    });

});

module.exports = router;