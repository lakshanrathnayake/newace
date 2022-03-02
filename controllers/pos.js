/**
 * Created by Shashika on 3/5/2018.
 */
var util = require('util');
var express = require('express');
var router = express.Router();
var base = require('./base')();
var helper = require('../helpers/image_file_saver');
var mysqlDB = require('../models/mysql');
var sessionQuery = mysqlDB.getQuery('pos_session');
var branchQuery = mysqlDB.getQuery('branch');
var billQuery = mysqlDB.getQuery('bill_summary');
var billInfoQuery = mysqlDB.getQuery('bill_info');
var paymentInfoQuery = mysqlDB.getQuery('bill_payment_info');
var storeQuery = mysqlDB.getQuery('stores');
var customerQuery = mysqlDB.getQuery('customer');
var returnItemsQuery = mysqlDB.getQuery('bill_return_info');
var syncLoop = require('sync-loop');
var querystring = require('querystring');
var request = require('request');
const nodemailer = require('nodemailer');
var logs = require('./logs');
var config = require('../config.json');
const fs = require('fs');
var csvHeaders = require('csv-headers');
let dates = require('date-and-time');
const superagent = require('superagent');
let imageConfig = require('../images.config.json');

// for api record audit table

var client_id = config.loyalty.client_id;
var client_secret = config.loyalty.client_secret;
var baseURL = config.loyalty.baseURL;
var csv = require('fast-csv');
var access_token = null;
var path = require('path');
const Json2csvParser = require('json2csv').Parser;
const apiRequest = require('request-promise') ;

var mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "hari.effective@gmail.com",
        pass: "hari.th.galexy"
    }
});

var bal = 0;
/**
 * Pos get end balance of the session
 */

router.post(base.router.getPattern('post.pos.end_cash_balance'), function (req, res) {

    bal = req.body.cash;

    var response = {
        status: 700
    };

    res.send(response);
});

/**
 * Pos get end balance of the session
 */

router.get(base.router.getPattern('get.pos.search_customer'), function (req, res) {

    let customer_string = req.query.customer_search_string;
    //var customer = mysqlDB.getModel('customer');

    customerQuery.searchCustomer(customer_string, function (customer_results) {

        if (customer_results[0]) {
            let customer_details = {
                id: customer_results[0].id,
                customer_name: customer_results[0].customerName,
                address: customer_results[0].address,
                mobile_no: customer_results[0].telephone,
                loyalty_reference: customer_results[0].loyaltyReference
            }

            return res.send({status: 200, data: customer_details});
        } else {
            return res.send({status: 400});
        }


    });


});

/**
 * Pos session management page
 */
router.get(base.router.getPattern('get.pos.session'), function (req, res, next) {
    var sessions = [];

    sessionQuery.findAll(req.session.user_id, function (results) {
        if (results && results != null) {
            sessions = results;
        }
        var currentRoute = 'get.pos.session';
        //res.send({
        //    route: currentRoute,
        //    user: base.getCurrentUser(req),
        //    sessions : JSON.parse(JSON.stringify(sessions))
        //});
        var profile =JSON.stringify(imageConfig.images.profile.file)
        var logo=JSON.stringify(imageConfig.images.logo.file)
        res.render('Pos/posSessionManagement', {
            route: currentRoute,
            user: base.getCurrentUser(req),
            images:{profile:profile,logo:logo},
            sessions: JSON.parse(JSON.stringify(sessions))
        });
    });

});

/**
 * Pos session summary
 */
router.get(base.router.getPattern('get.pos.session') + '/summary/:id', function (req, res, next) {
    var session_id = req.params.id;
    var currentRoute = 'get.pos.cashBox';

    var cash = 0;
    var credit = 0;
    var loyalty = 0;
    var gift = 0;
    var recash = 0;
    var paymentsMap = {
        '1': cash,
        '2': credit,
        '3': gift,
        '4': loyalty,
        '6': recash,
    };
    var discount=0;
    console.log("*****************************************************************");
    sessionQuery.findSessionById(session_id, function (session) {
        paymentInfoQuery.findAllPayments(session_id, function (bill) {
            if (bill) {
                var branch_id = 0;
                for (var i = 0; i < bill.length; i++) {
                    paymentsMap['' + bill[i].paymentMethodId] += bill[i].amount;
                    branch_id = bill[i].bill_summary.branch_id;
                    //cash += bill[i].amount;
                }
            }
            billInfoQuery.findAllSessionBillItemInfo(session_id, session.cashierId, function (status3, billItemInfo) {
                if (status3){
                    billItemInfo.forEach(billItem => {
                        discount=discount+(billItem.dataValues.unitPrice*billItem.dataValues.discount/100).toFixed(2)*1;
                    });
                }

            });


            billInfoQuery.findAllSessionBillTotal(session_id, session.cashierId, function (status4, billItemInfo) {
                if (status4){
                    billItemInfo.forEach(billItem => {

                        if (billItem.dataValues.bill_summary.discount_type=="Rs"){
                            discount=discount+ billItem.dataValues.bill_summary.dataValues.discount;
                        }else {
                            discount=discount+ (billItem.dataValues.total*billItem.dataValues.bill_summary.dataValues.discount/100).toFixed(2)*1
                        }
                    });
                }

            });

            console.log('discount',discount)
            branchQuery.findBranchById(branch_id, function (branch) {
                var address = {
                    address: "",
                    telephone: ""
                };
                if (branch) {
                    address.address = branch.address;
                    address.telephone = branch.telephone;
                }

                billInfoQuery.countItemsBySession(session_id, session.cashierId, function (status2, count) {
                    console.log("--------------------------------------------------------------");


                    /*
                     var message = JSON.stringify(allX);
                     fs.appendFile('./public/session/files/estate.csv', '\n'+message+',' , (err) => {
                     if (err) throw err;

                     });
                     processFile('./public/session/files/estate.csv');*/

                    var options = {
                        file: './public/session/files/cashbox_audit.csv',
                        delimiter: ','
                    };

                    let now = new Date();

                    const csvLogLine = String(["\"" + dates.format(now, 'MM/DD/YYYY ') + " \"", "\"" + dates.format(now, 'hh:mm A') + " \"", "\"" + session_id + "\"", "\"" + session.user.username + "\"", "\"" + session.user.id + "\"", "\"" + session.user.user_role.code + "\"", "\"" + req.session.branchName + "\"", "\"" + session.startBalance + "\"", "\"" + bal + "\""]);

                    fs.appendFile('./public/session/files/cashbox_audit.csv', '\n' + csvLogLine + '', (err) => {
                        if (err) throw err;
                    });

                    var profile =JSON.stringify(imageConfig.images.profile.file)
                    var logo=JSON.stringify(imageConfig.images.logo.file)
                    if (!discount)
                    {
                        discount=0;
                    }
                    res.render('Pos/posSessionSummary', {
                        route: currentRoute,
                        session: parseInt(session_id),
                        address: address,
                        sess: session,
                        payments: paymentsMap,
                        discount:discount,
                        product_count: count,
                        product_count_status: status2,
                        user: base.getCurrentUser(req),
                        images:{profile:profile,logo:logo}
                    });
                });

            });
        });
    });
});

/**
 * session analysis
 */
router.get(base.router.getPattern('get.sales.reports'), function (req, res) {


    var stream = fs.createReadStream("./public/session/files/cashbox_audit.csv");
    console.log('xxxxxxxxxxxxxxxxxx');
    console.log(base.getCurrentUser(req));

    var csv_data = [];
    csv.parseStream(stream, {ignoreEmpty: true}).on("data", function (data) {
        csv_data.push(data);

    }).on("end", function () {
        var currentRoute = 'get.sales.reports';
        var profile =JSON.stringify(imageConfig.images.profile.file)
        var logo=JSON.stringify(imageConfig.images.logo.file)
        res.render('backend/pos/session', {

            result: csv_data,
            user: base.getCurrentUser(req),
            route: currentRoute,
            images:{profile:profile,logo:logo}

        });
    });


});


/**
 * Pos new session
 */

router.post(base.router.getPattern('get.pos.session'), function (req, res, next) {


    var cash = req.body.cash;
    var cashier = req.body.cashier;
    var session_id = req.body.session_id;
    var endbalance = req.body.endbalance;



    console.log(req.body);
    var response = {
        session_id: null,
        status: 500
    };
    if (session_id == 0) {
        sessionQuery.addSession({
            id: null,
            startTime: new Date(),
            startBalance: cash,
            cashierId: cashier,
            statusId: 1
        }, function (session) {
            if (session && session != null) {
                response.session_id = session.id;
                response.status = 200;
            }
            res.send(response);
        });
    }
    else {
        sessionQuery.updateSession({
            session_id: session_id,
            cashier_id: cashier,
            up: {
                endTime: Date.now(),
                endBalance: cash,
                statusId: 2
            }
        }, function (session) {
            response.status = 700;
            response.session_id = session.id;
            res.send(response);
        });
    }



});

/**
 * Pos end session
 */
router.post(base.router.getPattern('get.pos.session') + '/endSession', function (req, res, next) {
    var sessionId = req.body.session;
    var cashier = req.body.cashier;
    var response = {
        session_id: null,
        status: 500
    };
    sessionQuery.updateSession({
        session_id: sessionId,
        cashier_id: cashier,
        up: {
            endTime: new Date(),
            statusId: 1,
        }
    }, function (session) {
        if (session && session != null) {
            response.status = 200;
        }
        res.send(response);
    });
});

/**
 * pos end session pos session summary
 */

router.post(base.router.getPattern('post.pos.newendsession'), function (req, res, next) {
    var sessionId = req.body.session_id;
    var cashier = parseInt(req.body.cashier);
    var end_balance = req.body.cash;


    var response = {
        session_id: null,
        status: 500
    };
    sessionQuery.updateSession({
        session_id: sessionId,
        cashier_id: cashier,
        up: {
            endTime: new Date(),
            statusId: 2,
            endBalance: end_balance
        }
    }, function (session) {
        if (session && session != null) {
            response.status = 700;
            response.session_id = session.id;
        }
        res.send(response);
    });
});


/**
 * Pos add customer
 */
router.post(base.router.getPattern('get.pos.session') + '/addCustomer', function (req, res, next) {
    var customer = JSON.parse(req.body.customer);
    var response = {
        customer_name: 'customer',
        customer_id: 0,
        email: "",
        loyaltyReference: "",
        status: 500
    };
    if (customer.loyaltyReference == null || customer.loyaltyReference == '') {
        var date = new Date();
        var postData = {
            "username": customer.telephone,
            "password": {
                "first": customer.telephone,
                "second": customer.telephone
            },
            "email": customer.email,
            "name": customer.customerName,
            "contactNo": customer.telephone,
            "gender": true,
            "dob": {
                "year": date.getFullYear(),
                "month": date.getMonth() + 1,
                "day": date.getDay()
            }

        };
        var url = baseURL + config.loyalty.urls.customer_registration;
        loginLoyaltyPlatform(function (status) {
            if (status) {
                var options = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + access_token
                    },
                    method: 'post',
                    body: JSON.stringify(postData),
                    uri: url
                };
                console.log(options);
                request(options, function (error, resp, body) {
                    console.log(error);
                    console.log(body);
                    console.log("status code : " + resp.statusCode);
                    if (!error && resp.statusCode == 200) {
                        console.log(typeof body);
                        body = JSON.parse(body);
                        customer.loyaltyReference = body.code;
                        customerQuery.addNewCustomer(customer, function (cus) {
                            if (cus && cus != null) {
                                response.customer_name = cus.customerName;
                                response.customer_id = cus.id;
                                response.email = cus.email;
                                response.loyaltyReference = cus.loyaltyReference;
                                response.status = 200;
                            }
                            res.send(response);
                        });
                    }
                    else {
                        response.status = resp.statusCode;
                        res.send(response);
                    }
                });
            }
            else {
                res.send(response);
            }


        });
    }
    else {
        customerQuery.addNewCustomer(customer, function (cus) {
            if (cus && cus != null) {
                response.customer_name = cus.customerName;
                response.customer_id = cus.id;
                response.email = cus.email;
                response.loyaltyReference = cus.loyaltyReference;
                response.status = 200;
            }
            res.send(response);
        });
    }
});

/**
 * Pos cash box page
 */
router.get(base.router.getPattern('get.pos.cashBox') + '/:id', function (req, res, next) {
    var session_id = req.params.id;
    var currentRoute = 'get.pos.cashBox';
    var total = 0;
    sessionQuery.findSessionById(session_id, function (session) {
        paymentInfoQuery.findCashPayments(session_id, function (bill) {
            if (bill) {
                for (var i = 0; i < bill.length; i++) {
                    total += bill[i].amount;
                }
            }
            console.log(session);
            var profile =JSON.stringify(imageConfig.images.profile.file)
            var logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('Pos/posCashBox', {
                route: currentRoute,
                session: parseInt(session_id),
                sess: session,
                total: total,
                images:{profile:profile,logo:logo},
                user: base.getCurrentUser(req)
            });
        });
    });

});

/**
 *
 * @param x date
 * @param y date format
 * @returns {*}
 */
format = function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length);
    });
};


/**
 * bill submission
 */
router.post(base.router.getPattern('get.pos.bill'), function (req, res, next) {
    var data = req.body;
    var tax_value=0;
    var token="";
    var bill = JSON.parse(data.bill);
    var response = {
        status: 500,
        billNo: null
    };

    var date = new Date();
    var customer = (bill.customer_id && bill.customer_id != null) ? parseInt(bill.customer_id) : 0;
    console.log('**********************************************************************************');
    console.log('ONLINE BILL SUBMISSION');
    if (!req.session.bills) {
        req.session.bills = JSON.stringify([bill.unique]);
    }
    else {
        var oldBills = JSON.parse(req.session.bills);
        console.log(oldBills);
        if (oldBills.indexOf(bill.unique) > 0) {
            response.status = 101;
            response.message = 'duplicate entry';
            return res.send(response);
        }
        else {
            oldBills.push(bill.unique);
            req.session.bills = JSON.stringify(oldBills);
        }
        console.log(req.session.bills);
    }
    console.log(bill);
    billQuery.addNewBill({
        id: null,
        billNo: data.branch + '/' + customer + '/' + Math.round(new Date() / 1000) + '',
        date: new Date(),
        expiry: new Date(date.setDate(date.getDate() + 7)),
        cashier_id: parseInt(data.cashier),
        //customerId : null,
        customer_id: (bill.customer_id && bill.customer_id != null) ? parseInt(bill.customer_id) : null,
        sessionId: parseInt(data.sessionId),
        branch_id: parseInt(data.branch),
        discount: (parseFloat(bill.discount)) ? parseFloat(bill.discount) : 0,
        discount_type: bill.discount_type,
        taxes: (parseFloat(bill.tax)) ? parseFloat(bill.tax) : 0,
        billStatusId: 1
    }, function (new_bill, err1) {
        if (new_bill && new_bill != null) {
            var items = [];
            var products = bill.products;
            console.log("NEW BILL_ID : " + new_bill.billNo);
            for (var i = 0; i < bill.products.length; i++) {
                items.push({
                    id: null,
                    billId: new_bill.id,
                    productId: parseInt(products[i].id),
                    qty: parseInt(products[i].qty),
                    unitPrice: parseFloat(products[i].cost),
                    discount: parseFloat(products[i].dis),
                    voucherCode: (products[i].voucher_code && products[i].voucher_code != null && products[i].voucher_code != '') ? products[i].voucher_code : null,
                    taxes: parseFloat(products[i].tax)
                });
            }
            billInfoQuery.addItems(items, function (billItems, err) {
                var cash_end = 0;
                var credit_end = 0;
                var recash = 0;
                var gift_end = 0;
                var loyalty_end = 0;
                var loyalty_pt_end = 0;
                //if(bill.return_flag){
                //    var credit_pay = bill.payments.filter(function(x){
                //        return x.paymentMethodId == 2
                //    });
                //    if(credit_pay.length > 0){
                //        credit_end = credit_pay[0].amount;
                //        console.log(credit_end);
                //    }
                //    var cash_pay = bill.payments.filter(function(x){
                //        return x.paymentMethodId == 1
                //    });
                //    if(cash_pay.length > 0){
                //        cash_end = cash_pay[0].amount;
                //
                //    }
                //    var gift_pay = bill.payments.filter(function(x){
                //        return x.paymentMethodId == 3
                //    });
                //    if(gift_pay.length > 0){
                //        gift_end = gift_pay[0].amount;
                //    }
                //}
                if (err == null) {
                    var payment_methods = [];
                    if (bill.credit > 0) {
                        payment_methods.push({
                            id: null,
                            billId: new_bill.id,
                            paymentMethodId: 2,
                            amount: bill.credit - credit_end,
                            referenceNo: bill.credit_ref + ''
                        });
                    }
                    if (bill.cash > 0) {
                        payment_methods.push({
                            id: null,
                            billId: new_bill.id,
                            paymentMethodId: 1,
                            amount: bill.cash + bill.balance - cash_end,
                            referenceNo: ''
                        });
                    }
                    if (bill.gift > 0) {
                        payment_methods.push({
                            id: null,
                            billId: new_bill.id,
                            paymentMethodId: 3,
                            amount: bill.gift - gift_end,
                            referenceNo: bill.gift_ref
                        });
                    }
                    if (bill.recash < 0) {
                        payment_methods.push({
                            id: null,
                            billId: new_bill.id,
                            paymentMethodId: 6,
                            amount: bill.recash - recash,
                            referenceNo: ''
                        });
                    }
                    if (bill.loyalty > 0) {
                        payment_methods.push({
                            id: null,
                            billId: new_bill.id,
                            paymentMethodId: 4,
                            amount: (bill.loyalty * bill.total / 100) - loyalty_end,
                            referenceNo: bill.loyalty_ref
                        });
                    }
                    if (bill.loyalty_pt > 0) {
                        payment_methods.push({
                            id: null,
                            billId: new_bill.id,
                            paymentMethodId: 5,
                            amount: bill.loyalty_pt - loyalty_pt_end,
                            referenceNo: bill.loyalty_pt_ref
                        });
                    }
                    paymentInfoQuery.addNewPayment(payment_methods, function (payment, err) {
                        if (err == null && payment && payment != null) {
                            response.billNo = new_bill.billNo;
                            response.date = new_bill.date;
                            response.expiry = new_bill.expiry;
                            response.status = 200;
                            storeQuery.qtyDecrement(parseInt(data.branch), bill.products);
                            sessionQuery.billIncrement(parseInt(data.sessionId));
                            if (bill.return_flag) {
                                loadReturns(new_bill.id, bill.return_products, function () {
                                    storeQuery.qtyIncrement(parseInt(data.branch), bill.return_products);
                                });
                            }
                            res.send(response);
                            if (bill.loyaltyReference != undefined && bill.loyaltyReference != '') {
                                console.log("LOYALTY ONLINE BILL REDEEM : " + new_bill.billNo);
                                loyaltyRedeem(data, function (status, code, postdate) {
                                    var state = (status) ? 'info' : 'error';
                                    logs.logs.insertLoyaltyLog(state, {
                                        type: 'REDEEM_POINTS ONLINE_BILL : ' + new_bill.billNo,
                                        branch: req.session.branch,
                                        username: req.session.username,
                                        req: postdate,
                                        res: {status: status, status_code: code},
                                        status: code
                                    });
                                });
                            }
                            logs.logs.insertBillLog('info', {
                                type: 'ONLINE : ' + new_bill.billNo,
                                status: 200,
                                err: 'null',
                                session: data.sessionId,
                                branch: data.branch,
                                bill: data
                            });


                            // this section explain the api integration
                        }
                        else {
                            console.log("ONLINE PAYMENT ERROR : " + new_bill.billNo);
                            var del = itemsDelete(billItems, function () {
                                new_bill.destroy();
                            });
                            response.delItemStatus = del;
                            res.send(response);
                            logs.logs.insertBillLog('error', {
                                type: 'ONLINE : ' + new_bill.billNo,
                                status: '500-PAY',
                                err: err.toString(),
                                session: data.sessionId,
                                branch: data.branch,
                                bill: data
                            });
                        }
                    });
                }
                else {
                    console.log("ONLINE BILL ITEMS ERROR : " + new_bill.billNo);
                    new_bill.destroy();
                    res.send(response);
                    logs.logs.insertBillLog('error', {
                        type: 'ONLINE: ' + new_bill.billNo,
                        status: '500-ITEMS',
                        err: err.toString(),
                        session: data.sessionId,
                        branch: data.branch,
                        bill: data
                    });
                }
            });
        }
        else {
            console.log("ONLINE BILL SUBMISSION ERROR : ");
            res.send(response);
            logs.logs.insertBillLog('error', {
                type: 'ONLINE : BILL EXCEPTION',
                status: '500-BILL',
                err: err1.toString(),
                session: data.sessionId,
                branch: data.branch,
                bill: data
            });
        }
    });

});

/**
 * add customer to bill
 */
router.post(base.router.getPattern('post.pos.add_customer_to_bill'), function (req, res) {

    let data = req.body;
    let bill_info = JSON.parse(req.body.bill);

    loginLoyaltyPlatform(function (status) {
        if (status) {
            if (req.body) {
                loyaltyRedeemCustomerAdd(data, function (status, code, dataX) {
                    if (status == true) {

                        let temp = {
                            billId: bill_info[0].billId,
                            loyaltyReference: data.loyaltyReference
                        }

                        billQuery.addCustomerToBill(temp, function (customerBillResponse) {
                            if (customerBillResponse.status == 200) {
                                res.send({status: 200});
                            } else {
                                res.send({status: 400});
                            }
                        })

                    } else {
                        res.send({status: 400});
                    }
                })

            } else {
                res.send({status: 400});
            }
        } else {
            res.send({status: 400});
        }
    });


});


/**
 * bill submission offline
 */
router.post(base.router.getPattern('get.pos.bill') + '/offline', function (req, res, next) {
    var data = req.body;
    var bills = JSON.parse(data.bill);
    var submitted = [];

    var response = {
        status: 500,
        billNo: null
    };

    var billIds = Object.keys(bills);
    var m = 0;
    console.log('OFFLINE BILL SUBMISSION');
    syncLoop(billIds.length, function (loop) {
        console.log(m + '************************************************************************************');
        console.log('BILL NO : ' + billIds[m]);
        var o_bill = bills[billIds[m]];
        var bill = (o_bill != undefined) ? JSON.parse(o_bill.bill) : null;
        if (o_bill != undefined) {
            billQuery.addNewBill({
                id: null,
                billNo: billIds[m] + '',
                date: new Date(o_bill.date),
                expiry: new Date(o_bill.expiry),
                customer_id: (bill.customer_id && bill.customer_id != null) ? parseInt(bill.customer_id) : null,
                sessionId: parseInt(o_bill.sessionId),
                cashier_id: parseInt(o_bill.cashier),
                branch_id: parseInt(o_bill.branch),
                discount: (parseFloat(bill.discount)) ? parseFloat(bill.discount) : 0,
                discount_type: bill.discount_type,
                taxes: (parseFloat(bill.tax)) ? parseFloat(bill.tax) : 0,
                billStatusId: 1
            }, function (new_bill, err1) {
                if (new_bill && new_bill != null) {
                    var items = [];
                    var products = bill.products;
                    for (var i = 0; i < bill.products.length; i++) {
                        items.push({
                            id: null,
                            billId: new_bill.id,
                            productId: parseInt(products[i].id),
                            qty: parseInt(products[i].qty),
                            unitPrice: parseFloat(products[i].cost),
                            discount: parseFloat(products[i].dis),
                            voucherCode: (products[i].voucher_code && products[i].voucher_code != null && products[i].voucher_code != '') ? products[i].voucher_code : null,
                            taxes: parseFloat(products[i].tax)
                        });
                    }
                    billInfoQuery.addItems(items, function (billItems, err) {
                        var cash_end = 0;
                        var credit_end = 0;
                        var gift_end = 0;
                        var loyalty_end = 0;
                        var loyalty_pt_end = 0;
                        if (err == null) {
                            var payment_methods = [];
                            if (bill.credit > 0) {
                                payment_methods.push({
                                    id: null,
                                    billId: new_bill.id,
                                    paymentMethodId: 2,
                                    amount: bill.credit - credit_end,
                                    referenceNo: bill.credit_ref + ''
                                });
                            }


                            if (bill.cash > 0) {
                                payment_methods.push({
                                    id: null,
                                    billId: new_bill.id,
                                    paymentMethodId: 1,
                                    amount: bill.cash + bill.balance - cash_end,
                                    referenceNo: ''
                                });
                            }


                            if (bill.recash < 0) {
                                payment_methods.push({
                                    id: null,
                                    billId: new_bill.id,
                                    paymentMethodId: 6,
                                    amount: bill.recash - recash,
                                    referenceNo: ''
                                });
                            }

                            if (bill.gift > 0) {
                                payment_methods.push({
                                    id: null,
                                    billId: new_bill.id,
                                    paymentMethodId: 3,
                                    amount: bill.gift - gift_end,
                                    referenceNo: bill.gift_ref
                                });
                            }
                            if (bill.loyalty > 0) {
                                payment_methods.push({
                                    id: null,
                                    billId: new_bill.id,
                                    paymentMethodId: 4,
                                    amount: (bill.loyalty * o_bill.total / 100) - loyalty_end,
                                    referenceNo: bill.loyalty_ref
                                });
                            }
                            if (bill.loyalty_pt > 0) {
                                payment_methods.push({
                                    id: null,
                                    billId: new_bill.id,
                                    paymentMethodId: 5,
                                    amount: bill.loyalty_pt - loyalty_pt_end,
                                    referenceNo: bill.loyalty_pt_ref
                                });
                            }
                            paymentInfoQuery.addNewPayment(payment_methods, function (payment, err) {
                                console.log('OFFLINE PAYMENTS' + billIds[m]);
                                if (err == null && payment && payment != null) {
                                    response.billNo = new_bill.billNo;
                                    response.date = new_bill.date;
                                    response.expiry = new_bill.expiry;
                                    response.status = 200;
                                    storeQuery.qtyDecrement(parseInt(data.branch), bill.products);
                                    sessionQuery.billIncrement(parseInt(data.sessionId));
                                    if (bill.return_flag) {
                                        console.log('RETURN PRODUCTS FOUND' + billIds[m]);
                                        loadReturns(new_bill.id, bill.return_products, function () {
                                            storeQuery.qtyIncrement(parseInt(data.branch), bill.return_products);
                                        });
                                    }
                                    submitted.push(new_bill.billNo);
                                    console.log();
                                    logs.logs.insertBillLog('info', {
                                        session: data.sessionId,
                                        type: 'OFFLINE : ' + billIds[m],
                                        status: 200,
                                        err: 'null',
                                        branch: data.branch,
                                        bill: o_bill
                                    });
                                    console.log('OFFLINE LOYALTY REDEEM' + billIds[m]);
                                    loyaltyRedeem(o_bill, function (status, code, postdate) {
                                        var state = (status) ? 'info' : 'error';
                                        logs.logs.insertLoyaltyLog(state, {
                                            type: 'REDEEM_POINTS OFFLINE_BILL : ' + billIds[m],
                                            branch: req.session.branch,
                                            username: req.session.username,
                                            req: postdate,
                                            res: {status: status, status_code: code},
                                            status: code
                                        });
                                        m++;
                                        loop.next();
                                    });
                                }
                                else {
                                    var del = itemsDelete(billItems, function () {
                                        new_bill.destroy();
                                    });
                                    m++;
                                    console.log('OFFLINE PAYMENT ERROR' + billIds[m]);
                                    logs.logs.insertBillLog('error', {
                                        type: 'OFFLINE : ' + billIds[m],
                                        status: '500-PAY',
                                        err: err.toString(),
                                        branch: data.branch,
                                        bill: data
                                    });
                                    loop.next();
                                }

                            });
                        }
                        else {
                            new_bill.destroy();
                            m++;
                            console.log('OFFLINE BILL ITEMS ERROR : ' + billIds[m]);
                            logs.logs.insertBillLog('error', {
                                session: data.sessionId,
                                type: 'OFFLINE : ' + billIds[m],
                                status: '500-ITEMS',
                                err: err.toString(),
                                branch: data.branch,
                                bill: data
                            });
                            loop.next();
                        }
                    });
                }
                else {
                    m++;
                    console.log('BILL SUMISSION ERROR' + billIds[m]);
                    logs.logs.insertBillLog('error', {
                        session: data.sessionId,
                        type: 'OFFLINE ;' + billIds[m],
                        status: '500-BILL',
                        err: err1.toString(),
                        branch: data.branch,
                        bill: data
                    });
                    loop.next();
                }
            });
        }
        else {
            m++;
            console.log('OFFLINE EMPTY/UNDEFINED BILL' + billIds[m]);
            loop.next();
        }
    }, function () {
        res.send({status: 200, submitted: submitted});
    });
});

/**
 * update return products
 * @param return_products
 * @param callback
 */
function loadReturns(new_bill_id, return_products, callback) {
    console.log('return products');
    console.log(return_products);
    var items = [];
    for (var i = 0; i < return_products.length; i++) {
        items.push({
            id: null,
            newBillId: new_bill_id,
            billItemId: return_products[i].item_id,
            qty: return_products[i].qty,
            reason: '',
            productId: return_products[i].id

        });


    }

    returnItemsQuery.addReturnItems(items, function (items, err) {
        callback();
    });
}

/**
 * delete records as error occured
 * @param items
 * @param callback
 */
function itemsDelete(items, callback) {
    try {
        for (var i = 0; i < items.length; i++) {
            items[i].destroy();
        }
        callback();
    }
    catch (e) {
        console.log(e.toString());
        callback();
    }

}

//
//router.post(base.router.getPattern('get.pos.search.customer'), function (req, res, next) {
//    var customer = req.body.data;
//
//});
/**
 * return product
 */
router.post(base.router.getPattern('get.pos.bill') + '/return', function (req, res, next) {
    var bill_id = req.body.bill_id;
    var branch_id = req.body.branch_id;
    var response = {
        status: 500,
        message: 'Bill finding error',
        bill: null
    };
    billQuery.findOneBill(bill_id, branch_id, function (bill) {
        if (bill && bill != null) {
            response.bill = {
                bill: JSON.parse(JSON.stringify(bill)),
                items: [],
                payment: null
            };
            var id = bill.id;
            var expiry = new Date(bill.expiry);
            //if(expiry >= new Date()){
            billInfoQuery.findAllItems(id, function (items) {
                console.log(items);
                console.log('*******************************')
                if (items && items != null) {
                    response.bill.items = items;
                }
                paymentInfoQuery.findPaymentByBill(id, function (payment) {
                    if (payment && payment != null) {
                        response.message = 'success';
                        response.bill.payment = payment;
                        response.status = 200;
                    }
                    res.send(response);
                });

            });
            //}
            //else{
            //    response.message = 'Bill Expired !!';
            //    response.status = 303;
            //    res.send(response);
            //}
        }
        else {
            response.message = 'Bill Not Found !! (Check the bill No and branch)';
            response.status = 303;
            res.send(response);
        }
    });
});


/**
 * Pos page
 */
router.get(base.router.getPattern('get.pos.pos') + '/:session_id', function (req, res, next) {

    var session_id = req.params.session_id;
    var branch_id = req.session.branch;
    var branch_name = req.session.branchName;
    var _address = req.session.address;
    var tel = req.session.telephone;
    var currentRoute = 'get.pos.pos';
    var storeQuery = mysqlDB.getQuery('stores');
    //var sessionQuery = mysqlDB.getQuery('stores');


    sessionQuery.findOneSession(session_id, req.session.user_id, function (session) {
        if (session && session != null && session.statusId != 2) {
            mysqlDB.getModel('category').findAll({
                attributes: ['id', 'categoryName']
            }).then(function (categories) {
                storeQuery.findAllByPage(parseInt(branch_id), 0, function (products) {
                    //storeQuery.findAllProducts(parseInt(branch_id),function(products){
                    //res.send({
                    //    route: currentRoute,
                    //    products : JSON.parse(JSON.stringify(products)),
                    //    categories : categories,
                    //    session : JSON.parse(JSON.stringify(session)),
                    //    date : new Date(),
                    //    user: base.getCurrentUser(req)
                    //});

                    var address = {
                        address: _address,
                        contact: tel
                    };

                    console.log(address);
                    var profile =JSON.stringify(imageConfig.images.profile.file)
                    var logo=JSON.stringify(imageConfig.images.logo.file)
                    var invoiceLogo=JSON.stringify(imageConfig.images.invoiceLogo.file)
                    res.render('Pos/pos', {
                        route: currentRoute,
                        products: JSON.parse(JSON.stringify(products)),
                        categories: categories,
                        session: JSON.parse(JSON.stringify(session)),
                        branch: branch_id,
                        address: JSON.parse(JSON.stringify(address)),
                        branch_name: branch_name,
                        date: new Date(),
                        images:{profile:profile,logo:logo,invoiceLogo:invoiceLogo},
                        user: base.getCurrentUser(req)
                    });
                });
            });
        }
        else {
            res.redirect('/pos/session');
        }
    });
});

router.get(base.router.getPattern('test'), function (req, res, next) {
    var barcode=JSON.stringify(imageConfig.images.barcode.file)
    res.render('print',{images:{barcode:barcode}});


});

/**
 * search customer
 */
router.post(base.router.getPattern('get.pos.session') + '/searchCustomer', function (req, res, next) {
    var str = req.body.content;
    console.log("\n\n"+req.body.content+" location B");
    customerQuery.searchCustomer(str, function (customers, err) {
        res.send({status: 200, data: JSON.parse(JSON.stringify(customers))})
    });

});


/**
 * search customer in loyalty through API
 */
router.post(base.router.getPattern('get.pos.session') + '/searchCustomerLoyalty', function (req, res, next) {
    var mobileNumber = req.body.content;
    loginLoyaltyPlatform(function (status) {
        if (status) {
            const options =
                {
                    method: "POST",
                    uri: baseURL+config.loyalty.urls.search_customer,                                           //baseURL + config.,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + access_token
                    },
                    body:{
                        "mobile":mobileNumber
                    },
                    json: true
                };
            // JSON stringifies the body automatically with the use of promise-request that is mentioned above with variable apiRequest
            apiRequest(options)
                .then(function (response)
                {
                    let jsonObj=response;
                    res.send({status: 200, data: jsonObj});
                })
                .catch(function (err)
                {
                    console.log(err);
                    return res.send({status:404})
                });
        }
        else {
            console.log(status+"\nthis is the status and it consists no output")
        }
    });
});
/**
 * findAll products for offline usage
 */
router.post(base.router.getPattern('get.pos.pos') + '/getAllProducts', function (req, res, next) {

    var offset = req.body.offset;
    var branch_id = req.body.branch;

    storeQuery.findAllProducts(parseInt(branch_id), function (products) {
        res.send({
            products: JSON.parse(JSON.stringify(products))
        });
    });
});

/**
 * *****************
 */
router.post(base.router.getPattern('get.pos.pos') + '/getProducts', function (req, res, next) {

    var offset = req.body.offset;
    var branch_id = req.body.branch;

    storeQuery.findAllByPage(parseInt(branch_id), parseInt(offset), function (products) {
        res.send({
            products: JSON.parse(JSON.stringify(products))
        });
    });
});

/**
 * *****************
 */
router.post(base.router.getPattern('get.pos.pos') + '/searchProducts', function (req, res, next) {

    var category = req.body.category;
    var name = req.body.name;
    var branch_id = req.body.branch;
    storeQuery.searchProduct(branch_id, category, name, function (products) {
        res.send({
            products: JSON.parse(JSON.stringify(products))
        });
    });
});

/**
 * Pos summary
 */
router.get(base.router.getPattern('get.pos.summary'), function (req, res, next) {
    var currentRoute = 'get.pos.session';
    var branch_id = req.session.branch;
    var profile =JSON.stringify(imageConfig.images.profile.file)
    var logo=JSON.stringify(imageConfig.images.logo.file)
    res.render('Pos/posSessionManagement', {
        route: currentRoute,
        user: base.getCurrentUser(req),
        sessions: JSON.parse(JSON.stringify(sessions)),
        images:{profile:profile,logo:logo}
    });
});

/**
 * Pos bill email
 */
router.post(base.router.getPattern('get.pos.pos') + '/email', function (req, res, next) {
    console.log('***********************************************');

    var mailOption = {
        from: "hari.effective@gmail.com", // sender address
        to: [req.body.email, 'hariharankanakaraja@gmail.com'], // list of receivers
        bcc: 'hari.effective@gmail.com',
        subject: "POS Bill", // Subject line
        html: JSON.parse(req.body.content) // html body
    };
    try {
        mailer.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
                console.log('************** email error **************');
                res.send(false);
            }
            else {
                console.log('Message sent: %s', info.messageId);
                res.send(true);
            }
        });
    }
    catch (e) {
        console.log('************** email send error  : **************' + e.toString());
        res.send(false);
    }

});

/**
 * Pos offline bill email
 */
router.post(base.router.getPattern('get.pos.pos') + '/offlineEmail', function (req, res, next) {
    var m = 0;
    var mailed = [];
    var emails = JSON.parse(req.body.emails);
    var email_ids = Object.keys(emails);
    syncLoop(email_ids.length, function (loop) {
        var email = emails[email_ids[m]];
        var mailOption = {
            from: "hari.effective@gmail.com", // sender address
            to: email.email, // list of receivers
            bcc: 'hari.effective@gmail.com',
            subject: "POS Bill", // Subject line
            html: email.content // html body
        };
        try {
            mailer.sendMail(mailOption, function (error, info) {
                if (error) {
                    console.log(error);
                    console.log('************** email error **************');
                    m++;
                    loop.next();
                }
                else {
                    mailed.push(email_ids[m]);
                    console.log(email_ids[m]);
                    console.log('Message sent: %s', info.messageId);
                    m++;
                    loop.next();
                }
            });
        }
        catch (e) {
            console.log('************** email send error  : **************' + e.toString());
            m++;
            loop.next();
        }
    }, function () {
        res.send({ids: mailed});
    });
});

/**
 * loyalty promo_code validation
 */
router.post(base.router.getPattern('get.pos.pos') + '/loyalty_voucher_validate', function (req, res, next) {
    var cashier_id = req.body.cashier_id;
    var voucher_code = req.body.voucher_code;
    var state = parseInt(req.body.state);
    var response = {status: 500, validity: false};
    console.log("************************************");
    if (typeof parseInt(cashier_id) == 'number' && voucher_code != null) {
        if (access_token != null) {
            promoValidityCheck(state, voucher_code, function (status, statusCode) {
                response.validity = status;
                response.status = statusCode;
                res.send(response);
                logs.logs.insertLoyaltyLog('info', {
                    type: 'VOUCHER_VALIDATE',
                    branch: req.session.branch,
                    username: req.session.username,
                    req: {state: state, voucher_code: voucher_code},
                    res: {status: status, status_code: statusCode},
                    status: statusCode
                });
            });
        }
        else {
            loginLoyaltyPlatform(function (sta) {
                if (sta) {
                    promoValidityCheck(state, voucher_code, function (status, statusCode) {
                        response.validity = status;
                        response.status = statusCode;
                        res.send(response);
                        //logFile[status]('Loyalty API Requests ['+data.type+'] : ['+data.branch+'] : ['+data.session+'] : ['+data.status+'] : ['+ JSON.stringify(data.req) +'] : ['+ JSON.stringify(data.res) +']');
                    });
                } else {
                    response.message = 'Can not contact loyalty platform server !!!';
                    response.status = 500;
                    res.send(response);
                }
            });
        }
    }
    else {
        response.message = 'Input error !!!';
        res.send(response);
        logs.logs.insertLoyaltyLog('error', {
            type: 'VOUCHER_VALIDATE', branch: req.session.branch, username: req.session.username,
            req: {state: state, voucher_code: voucher_code}, res: {status: 500, status_code: '500-e'}, status: '500-e'
        });
    }
});

/**
 * loyalty redeem API
 * @type {number}
 */
var step = 0;

function loyaltyRedeem(data, callback) {

    console.log(data);
    console.log("LOYALTY REDEEM STEP: " + step);
    var records = [];
    var bill = (data != undefined) ? JSON.parse(data.bill) : null;
    var products = (bill != null) ? bill.products : [];
    for (var i = 0; i < products.length; i++) {
        records.push({
            name: products[i].name,
            description: "",
            qty: parseInt(products[i].qty),
            amount: parseFloat(products[i].amount),
            voucher_code: (products[i].voucher_code && products[i].voucher_code != null && products[i].voucher_code != '') ? products[i].voucher_code : null
        });
    }
    if (bill.loyaltyReference != undefined && bill.loyaltyReference != '') {
        var postData = {
            "code": bill.loyaltyReference,
            "amount": bill.paid_total - bill.loyalty_pt,
            "points": null,
            "itemName": "Bill",
            "description": "full bill",
            "promotion_voucher_code": bill.loyalty_ref,
            "redeem_voucher_code": bill.loyalty_pt_ref,
            "records": records
        };
        var url = baseURL + config.loyalty.urls.client_transaction;
        var options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            },
            method: 'post',
            body: JSON.stringify(postData),
            uri: url
        };
        console.log("LOYALTY REDEEM : " + options);
        try {
            request(options, function (error, response, body) {
                console.log("status code : " + response.statusCode);
                if (!error && response.statusCode == 200) {
                    step = 0;
                    callback(true, response.statusCode, postData);
                }
                else if (!error && response.statusCode == 401) {
                    if (step > 2) {
                        console.log('STEP FINISHED:' + step);
                        step = 0;
                        callback(false, 401, postData);
                    }
                    else {
                        console.log('STEP:' + step);
                        loginLoyaltyPlatform(function (sta) {
                            if (sta) {
                                loyaltyRedeem(data, function (status, code) {
                                    callback(status, code, postData);
                                });
                            } else {
                                callback(false, 401, postData);
                            }
                        });
                    }
                    step++;

                }
                else {
                    console.log(error);
                    step = 0;
                    callback(false, response.statusCode, postData);
                }
            });
        }
        catch (e) {
            step = 0;
            console.log(e.toString());
            callback(false, 500, postData);
        }
    }
    else {
        callback(false, 500, []);
    }


}


/**
 * loyalty redeem API
 * @type {number}
 */
var step = 0;

function loyaltyRedeemCustomerAdd(data, callback) {

    var records = [];
    var bill = JSON.parse(data.bill);


    for (var i = 0; i < bill.length; i++) {
        records.push({
            name: bill[i].product.productName,
            description: "",
            qty: parseInt(bill[i].qty),
            amount: parseFloat(bill[i].unitPrice),
            voucher_code: null
        });

    }

    if (data.loyaltyReference != undefined && data.loyaltyReference != '') {
        var postData = {
            "code": data.loyaltyReference,
            "amount": data.paid_total,
            "points": null,
            "itemName": "Bill",
            "description": "full bill",
            "promotion_voucher_code": null,
            "redeem_voucher_code": null,
            "records": records
        };


        var url = baseURL + config.loyalty.urls.client_transaction;
        var options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            },
            method: 'post',
            body: JSON.stringify(postData),
            uri: url
        };
        console.log('xxxxxxxxxxxx')
        console.log("LOYALTY REDEEM : " + options);
        try {
            request(options, function (error, response, body) {
                console.log("status code : " + response.statusCode);
                if (!error && response.statusCode == 200) {
                    step = 0;
                    callback(true, response.statusCode, postData);
                }
                else if (!error && response.statusCode == 401) {
                    if (step > 2) {
                        console.log('STEP FINISHED:' + step);
                        step = 0;
                        callback(false, 401, postData);
                    }
                    else {
                        console.log('STEP:' + step);
                        loginLoyaltyPlatform(function (sta) {
                            if (sta) {
                                loyaltyRedeem(data, function (status, code) {
                                    callback(status, code, postData);
                                });
                            } else {
                                callback(false, 401, postData);
                            }
                        });
                    }
                    step++;

                }
                else {
                    console.log(error);
                    step = 0;
                    callback(false, response.statusCode, postData);
                }
            });
        }
        catch (e) {
            step = 0;
            console.log(e.toString());
            callback(false, 500, postData);
        }
    }
    else {
        callback(false, 500, []);
    }


}




/**
 * get access_token from loyalty platform
 * @param callback
 */
function loginLoyaltyPlatform(callback) {
    console.log("###################################################LOYALTY PLATFORM LOGIN");
    var form = {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "client_credentials",
        scope: "pos"
    };
    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: baseURL + config.loyalty.urls.login,
        body: formData,
        method: 'POST'
    }, function (error, resp, body) {

        if (!error && resp.statusCode == 200) {
            body = JSON.parse(body);
            access_token = body.access_token;
            console.log(access_token +"\naccess token is set");
            callback(true);
        }
        else {
            callback(false);
        }
    });
}

/**
 * promo validation check
 * @type {number}
 */
var step = 0;

function promoValidityCheck(state, voucher_code, callback) {
    var postData = {voucher_code: voucher_code};
    var url = baseURL + config.loyalty.urls.voucher_verification;
    if (state == 0) {
        postData = {redeem_code: voucher_code};
        url = baseURL + config.loyalty.urls.redeem_voucher_verification;
    }
    var options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        },
        method: 'post',
        body: JSON.stringify(postData),
        uri: url
    };
    console.log(options);
    request(options, function (error, response, body) {
        console.log(error);
        console.log(body);
        console.log("status code : " + response.statusCode);
        if (!error && response.statusCode == 200) {
            callback(true, response.statusCode);
        }
        else if (!error && response.statusCode == 401) {
            step++;
            if (step > 2) {
                callback(false, 401);
                step = 0;
            }
            else {
                loginLoyaltyPlatform(function (sta) {
                    if (sta) {
                        promoValidityCheck(state, voucher_code, function (status, code) {
                            callback(status, code);
                        });
                    } else {
                        callback(false, 401);
                    }
                });
            }

        }
        else {
            callback(false, response.statusCode);
        }
    });
}


module.exports = router;