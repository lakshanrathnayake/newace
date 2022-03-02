const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const paymentInfoQuery = mysqlDB.getQuery('bill_payment_info');
const syncLoop = require('sync-loop');
const excelbuilder = require('msexcel-builder-colorfix');
const path = require('path');
let imageConfig = require('../images.config.json');


/**
 * revenue analysis filter
 */
router.get(base.router.getPattern('get.revenue_analysis.revenue'), function (req, res, next) {

    let date = new Date();
    let currentRoute = 'get.revenue_analysis.revenue';

    getPayments(date, date, null, null, function (results) {
    
        calculateRevenue(results, function (report) {

            let user_model = mysqlDB.getModel('user');
            let branch_model = mysqlDB.getModel('branch');
            user_model.findAll({
                attributes: ['id', 'username', 'branchId']
            }).then(function (cashier) {
                let columns = ['cash', 'credit', 'gift', 'loyalty_voucher', 'loyalty_points', 'return_cash', 'bills', 'total'];
                let cashiers = [];
                if (cashier != null && cashier) {
                    cashiers = JSON.parse(JSON.stringify(cashier));
                }

                branch_model.findAll().then(function (branches) {
                    let profile = JSON.stringify(imageConfig.images.profile.file)
                    let logo = JSON.stringify(imageConfig.images.logo.file)
            
                 

                    res.render('backend/order_analysis/revenue_analysis', {
                        report: JSON.parse(JSON.stringify(report)),
                        branches: JSON.parse(JSON.stringify(branches)),
                        cashiers: cashiers,
                        route: currentRoute,
                        nop: 5,
                        columns: columns,
                        images: {profile: profile, logo: logo},
                        user: base.getCurrentUser(req)
                    });

                });


            });
        });


    });
});

/**
 * revenue post analysis filter
 */
router.post(base.router.getPattern('get.revenue_analysis.revenue'), function (req, res, next) {
    let cashiers = JSON.parse(req.body.cashiers);
    (cashiers.indexOf('0') >= 0) ? cashiers = null : 0;
    let branches = JSON.parse(req.body.branches);
    (branches.indexOf('0') >= 0) ? branches = null : 0;

    let from = new Date(req.body.from);
    let end = req.body.end;
    end = (end !== '' && end != null && end) ? new Date(end) : new Date();

    let period = req.body.period;
    let periods;
    periods = getPeriod(period, from, end);
    let columns = ['cash', 'credit', 'gift', 'loyalty_voucher', 'loyalty_points', 'return_cash', 'bills', 'total'];
    let reports = {};
    let i = 0;
    syncLoop(periods.dates.length, function (loop) {
        reports[periods.dates[i]] = {};
        let from = new Date(periods.dates[i]);
        from = new Date(from.setHours(0, 0, 0, 0));
        let end;
        switch (periods.period) {
            case "DAY":
                end = new Date(from.setHours(23, 59, 59, 999));
                break;
            case "MONTH":
                end = new Date(from.getFullYear(), from.getMonth() + 1, 0);
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
            case "YEAR":
                end = new Date(from.getFullYear(), 11, 31);
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
        }
        reports[periods.dates[i]] = {};
        getPayments(from, end, branches, cashiers, function (results) {
            calculateRevenue(results, function (report) {
                reports[periods.dates[i]] = report;
                i++;
                loop.next();
            });
        });
    }, function () {
        revenueFilterReverse(reports, function (re_reports) {
            res.send({
                report: reports, body: req.body, cols: 8,
                columns: columns, re_report: re_reports, dates: periods.dates
            });
        });

    });
});



router.post(base.router.getPattern('get.revenue_analysis.revenue') + '/report', function (req, res, next) {
    let cashiers = JSON.parse(req.body.cashiers);
    (cashiers.indexOf('0') >= 0) ? cashiers = null : 0;
    let branches = JSON.parse(req.body.branches);
    (branches.indexOf('0') >= 0) ? branches = null : 0;

    let from = new Date(req.body.from);
    let end = req.body.end;
    end = (end && end != null && end != '') ? new Date(end) : new Date();

    let period = req.body.period;
    let periods;
    periods = getPeriod(period, from, end);
    let columns = ['cash', 'credit', 'gift', 'loyalty_voucher', 'loyalty_points', 'return_cash', 'bills', 'total'];
    let reports = {};
    let i = 0;
    syncLoop(periods.dates.length, function (loop) {
        reports[periods.dates[i]] = {};
        let from = new Date(periods.dates[i]);
        from = new Date(from.setHours(0, 0, 0, 0));
        let end;
        switch (periods.period) {
            case "DAY":
                end = new Date(from.setHours(23, 59, 59, 999));
                break;
            case "MONTH":
                end = new Date(from.getFullYear(), from.getMonth() + 1, 0);
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
            case "YEAR":
                end = new Date(from.getFullYear(), 11, 31);
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
        }
        reports[periods.dates[i]] = {};
        getPayments(from, end, branches, cashiers, function (results) {
            calculateRevenue(results, function (report) {
                reports[periods.dates[i]] = report;
                i++;
                loop.next();
            });
        });
    }, function () {
        revenueFilterReverse(reports, function (re_reports) {
            //TODO  add function here

            toxlsx({
                report: reports,
                body: req.body,
                cols: 8,
                columns: columns,
                re_report: re_reports,
                dates: periods.dates,
            }, function (status, link) {
                if (status) {
                    res.send({status: 200, link: link + '.xlsx'});
                } else {
                    res.send({status: 500});
                }
            });


        });

    });

});


/**
 * download revenue analysis report
 */
router.post(base.router.getPattern('get.revenue_analysis.revenue') + '/download', function (req, res, next) {
    let file = req.body.file_name;
    console.log('revenue report download action ///////////////////////')
    res.download(path.join(__dirname, '../public/reports/revenue_reports/' + file));
});


////////////////Support Functions//////////////////////
//////////////////////////////////////////////////////

function revenueFilterReverse(reports, callback) {
    let dates = Object.keys(reports);
    let re_report = {};
    for (let i = 0; i < dates.length; i++) {
        let report = reports[dates[i]];
        let branches = Object.keys(report);
        for (let j = 0; j < branches.length; j++) {
            let branch = report[branches[j]];
            (re_report[branches[j]] === undefined) ? re_report[branches[j]] = {} : {};

            let cashiers = Object.keys(branch);
            for (let k = 0; k < cashiers.length; k++) {

                (re_report[branches[j]][cashiers[k]] === undefined) ?
                    re_report[branches[j]][cashiers[k]] = {} : 0;
                re_report[branches[j]][cashiers[k]][dates[i]] = branch[cashiers[k]];
            }
        }
    }
    callback(re_report);
}

function toxlsx(data, callback) {

    let from = new Date(data.body.from);
    let end = new Date(data.body.end);
    let title = 'RevenueReport' + '-' + (from.getMonth() + 1) + '-' + from.getDate() + '_TO_' +
        end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();


    let reports = data.report;
    let cashiers = JSON.parse(data.body.cashiers);
    let branch_list = JSON.parse(data.body.branch_list);
    let cashier_list = JSON.parse(data.body.cashier_list);
    let branches = JSON.parse(data.body.branches);
    let branch_keys = branches;
    let cols = data.cols;
    let columns = data.columns;


    // callback(false, null);

    if (cashiers.indexOf('0') >= 0) {
        cashiers = cashier_list.filter(function (x) {
            return cashier_list.indexOf(x);
        });
    }
    if (branches.indexOf("0") >= 0) {
        branches = [];
        branch_list.forEach(function (val) {
            if (val != null && val) {
                branches.push(branch_list.indexOf(val))
            }
        });
        branch_keys = branches;
    }

    let span = columns.length;
    let workbook = excelbuilder.createWorkbook('./public/reports/revenue_reports/', title + '.xlsx');
    let sheet1 = workbook.createSheet('sheet', (branch_keys.length * 8) + 2, 24 * 6 * 60 + 1);
    for (let i = 0; i < branch_keys.length; i++) {
        //sheet.set(col, row, str)
        sheet1.merge({col: (i * span) + 2, row: 1}, {col: (i * span) + 8, row: 1});
        sheet1.set((i * span) + 2, 1, branch_list[branch_keys[i]] + ' (LKR)');
        sheet1.align((i * span) + 2, 1, 'center');
    }
    sheet1.set(1, 2, 'date');
    sheet1.align(1, 2, 'center');
    for (let i = 0; i < branch_keys.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            sheet1.set((i * 8) + 2 + j, 2, columns[j]);
            sheet1.align((i * 8) + 2 + j, 2, 'center')
        }
    }
    let dates = Object.keys(reports);

    for (let i = 0; i < dates.length; i++) {
        let report = reports[dates[i]];
        let dat = new Date(dates[i]);
        sheet1.set(1, i + 3, dat.getFullYear() + '/' + (dat.getMonth() + 1) + '/' + dat.getDate());
        sheet1.align(1, i + 3, 'center');
        let col_start = 2;
        for (let k = 0; k < branch_keys.length; k++) {
            let branch_id = branch_keys[k];
            if (report[branch_id]) {
                for (let j = 0; j < columns.length; j++) {
                    let val = (columns[j] == 'bills') ? Object.keys(report[branch_id].payments[columns[j]]).length : report[branch_id].payments[columns[j]];
                    sheet1.set(col_start, i + 3, val);
                    sheet1.align(col_start, i + 3, 'right');
                    col_start += 1;
                }
            } else {
                sheet1.merge({col: (k * span) + 2, row: i + 3}, {col: (k * span) + 8, row: i + 3});
                sheet1.set((k * span) + 2, i + 3, '0');
                sheet1.align((k * span) + 2, i + 3, 'right');
                col_start += 8;
            }
        }
    }
    workbook.save(function (err) {
        if (err != null && err) {
            workbook.cancel();
            callback(false, null);
        } else {
            callback(true, title);
        }
    });
}

function calculateRevenue(results, callback) {
    let report = {};
    let payments_map = {1: 'cash', 2: 'credit', 3: 'gift', 4: 'loyalty_voucher', 5: 'loyalty_points', 6: 'return_cash'};

    for (let i = 0; i < results.length; i++) {
        let bill_summary = results[i].bill_summary;
        let payments = {
            cash: 0,
            credit: 0,
            gift: 0,
            return_cash: 0,
            loyalty_voucher: 0,
            loyalty_points: 0,
            total: 0,
            bills: {}
        };
        (!report[bill_summary.branch_id]) ? report[bill_summary.branch_id] = {
            payments: JSON.parse(JSON.stringify(payments))
        } : 0;

        (!report[bill_summary.branch_id][bill_summary.user.username]) ?
            report[bill_summary.branch_id][bill_summary.user.username] = {payments: JSON.parse(JSON.stringify(payments))} : 0;

        report[bill_summary.branch_id][bill_summary.user.username].payments.bills[results[i].billId] = 1;
        report[bill_summary.branch_id][bill_summary.user.username].payments.total += Number(results[i].amount).toFixed(2)*1;
        

        report[bill_summary.branch_id][bill_summary.user.username].payments[payments_map[results[i].paymentMethodId]] += Number(results[i].amount).toFixed(2)*1;
        report[bill_summary.branch_id].payments[payments_map[results[i].paymentMethodId]] += Number(results[i].amount).toFixed(2)*1;
  

        report[bill_summary.branch_id].payments.bills[results[i].billId] = 1;
        report[bill_summary.branch_id].payments.total += Number(results[i].amount).toFixed(2)*1;
        results[i].amount  =  Number(results[i].amount).toFixed(2)*1;
        report[bill_summary.branch_id].payments[payments_map[results[i].paymentMethodId]] = Number(report[bill_summary.branch_id].payments[payments_map[results[i].paymentMethodId]]).toFixed(2)*1
  

    }

    callback(report);
}

function decimalFormatter(num){
    return (Math.floor(num / 1) * 1).toFixed(2);
}

function getPayments(from, end, branch_id, cashiers, callback) {
    let results = [];
    paymentInfoQuery.findPaymentsForAnalysis({
        from: from,
        end: end,
        branch_id: branch_id,
        cashiers: cashiers
    }, function (payments) {
        if (payments && payments != null) {
            results = JSON.parse(JSON.stringify(payments));
        }
        callback(results);
    });
};

/**
 * get date period
 * @param group
 * @param from
 * @param end
 * @returns {{period: string, from: *, end: *, dates: Array}}
 */
function getPeriod(group, from, end) {
    let period = {
        period: "MONTH",
        from: from,
        end: end,
        dates: []
    };
    switch (true) {
        case group.indexOf('DAY') >= 0 :
            period.period = "DAY";
            break;
        case group.indexOf('MONTH') >= 0 :
            period.from = new Date(from.getFullYear(), from.getMonth(), 1);
            period.end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
            period.period = "MONTH";
            break;
        case group.indexOf('YEAR') >= 0 :
            period.from = new Date(from.getFullYear(), 0, 1);
            period.end = new Date(end.getFullYear(), 11, 31);
            period.period = "YEAR";
            break;
        default :
            period.from = new Date(from.getFullYear(), from.getMonth(), 1);
            period.end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
            period.period = "MONTH";
            break;
    }
    period.dates = getDateArray(period);
    return period;
}


/**
 * format search date array
 * @param attr
 * @returns {Array}
 */
let getDateArray = function (attr) {
    let endDate = new Date(attr.end);
    endDate = new Date(endDate.setHours(23, 59, 59, 999));
    let startDate = new Date(attr.from);
    startDate = new Date(startDate.setHours(0, 0, 0, 0));
    let dateArray = [];
    let current = startDate;

    while (current <= endDate) {
        dateArray.push(current.toDateString().toString());

        if (attr.period === "YEAR") {
            current = new Date(current.setFullYear(current.getFullYear() + 1));
        } else if (attr.period === "MONTH") {
            current = new Date(current.setMonth(current.getMonth() + 1));
        } else if (attr.period === "DAY") {

            current = new Date(current.setDate(current.getDate() + 1));
        }

    }
    return dateArray;
};


module.exports = router;