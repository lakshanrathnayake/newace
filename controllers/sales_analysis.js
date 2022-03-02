const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const billQuery = mysqlDB.getQuery('bill_summary');
const billInfoQuery = mysqlDB.getQuery('bill_info');
const returnItemsQuery = mysqlDB.getQuery('bill_return_info');
const syncLoop = require('sync-loop');
const excelbuilder = require('msexcel-builder-colorfix');
const imageConfig = require('../images.config.json');
const moment = require('moment');
/**
 * order analysis page
 */
router.get(base.router.getPattern('get.sales_analysis.home'), function (req, res, next) {
    let branches;
    let categories = [];
    req.query.state = 1;
    base.listFilter('Branch', req, ['branchName', 'state', 'type'], function (list) {
        branches = list;
    });
    let date = new Date();
    let end = new Date(date.setHours(23, 59, 59, 999));

    let start = new Date();
    start = new Date(start.setHours(0, 0, 0, 0));
    ////console.log(results);
    while (branches === undefined) {
        require('deasync').runLoopOnce();
    }
    let currentRoute = 'get.sales_analysis.home';
    mysqlDB.getModel('category').findAll({
        attributes: ['id', 'categoryName']
    }).then(function (category) {
        if (category && category != null) {
            categories = category;
        }
        billQuery.findByDate({
            flag: 'dis', from: start, end: end, attributes: ['id']
        }, function (bills) {
            billInfoQuery.findProductsByBillId(bills, function (products) {
                let bills2;
                if (products && products != null) {
                    bills2 = [];
                    products.map(function (x) {
                        ////console.log(x.id);
                        bills2.push(x.id);
                    });
                }
                else {
                    bills2 = [];
                }
                while (bills2 === undefined) {
                    require('deasync').runLoopOnce();
                }
                returnItemsQuery.findProductsByBillItemIds(bills2, function (return_products) {
                    calculateAmounts(products, return_products, function (report) {


                        var profile =JSON.stringify(imageConfig.images.profile.file)
                        var logo=JSON.stringify(imageConfig.images.logo.file)
                        let user_model = mysqlDB.getModel('user');
                        user_model.findAll({
                            where: {
                                roleId: {$in: [3, 2]}
                            }, attributes: ['id', 'username', 'branchId']
                        }).then(function (users) {
                            res.render('backend/order_analysis/sales_analysis', {
                                report: JSON.parse(JSON.stringify(report)),
                                branches: JSON.parse(JSON.stringify(branches)),
                                categories: JSON.parse(JSON.stringify(categories)),
                                route: currentRoute,
                                all_flag: true,
                                user: base.getCurrentUser(req),
                                users: JSON.parse(JSON.stringify(users)),
                                products: JSON.parse(JSON.stringify(products)),
                                images:{profile:profile,logo:logo},
                                return_products: JSON.parse(JSON.stringify(return_products))
                            });
                        });

                    });
                });
            });
        });

    });
    //res.send(branches);
});

/**
 * pos analysis filter
 */
router.post(base.router.getPattern('get.sales_analysis.home') + '/filter', function (req, res, next) {

    let group = JSON.parse(req.body.group_by);
    let parameters = "";
    let attr = {};
    let name = req.body.name;
    attr.name = (name && true && name !== "" && name !== "*") ? name : null;

    let branch = parseInt(req.body.branch);
    attr.branch_id = (branch && branch > 0) ? branch : null;


    let from = new Date(req.body.from);
    let end = req.body.end;
    end = (end && true && end !== '') ? new Date(end) : new Date();

    parameters = getPeriod(group, from, end);
    parameters.groupBy=group[0]
    parameters.attr = attr;



    queryMaker(parameters,function (query){
        billInfoQuery.salesReport(query,function (result) {

            let response = {
                product_by: parameters.groupBy,
                groupBy:  parameters.period,
                period:parameters.period,
                dates:parameters.dates,
                results: JSON.parse(JSON.stringify(result))
            };
            res.send(response);

        })
    })

});

function queryMaker(parameters,callBack)
{
    let query="SELECT ";

    syncLoop(parameters.dates.length, function (loop) {

        var index = loop.iteration(); // index of loop, value from 0 to (numberOfLoop - 1)

        let from=new Date(parameters.dates[index]);
        let end=from;
        switch (parameters.period) {
            case "DAY":
                from =  new Date( from.setHours(0, 0, 0, 0));
                end  =  new Date(end.setHours(23, 59, 59, 999));
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

        from=  moment(from).format('YYYY-MM-DD HH:mm:ss')
        end=  moment(end).format('YYYY-MM-DD HH:mm:ss')

        let queryRev="SUM(CASE WHEN `bill_summary`.`date`>='"+from+"' AND `bill_summary`.`date`<='"+end+"' THEN `bill_item_info1`.`unit_price`*`bill_item_info1`.`qty` ELSE 0 END) As `"+parameters.dates[index].replace(/\s/g, "")+"_REV`,"
        let queryQty="SUM(CASE WHEN `bill_summary`.`date`>='"+from+"' AND `bill_summary`.`date`<='"+end+"' THEN `bill_item_info1`.`qty` ELSE 0 END) As `"+parameters.dates[index].replace(/\s/g, "")+"_QTY`,"
        query=query+queryRev+queryQty

        loop.next();

    }, function () {
        var wholeEnd= new Date(parameters.end)
        wholeEnd= wholeEnd.setHours(23, 59, 59, 999)

        let queryRevTotal="SUM(CASE WHEN `bill_summary`.`date`>='"+moment(parameters.from).format('YYYY-MM-DD HH:mm:ss')+"' AND `bill_summary`.`date`<='"+moment(wholeEnd).format('YYYY-MM-DD HH:mm:ss')+"' THEN `bill_item_info1`.`unit_price`*`bill_item_info1`.`qty` ELSE 0 END) As `Total_REV`,"
        let queryQtyTotal="SUM(CASE WHEN `bill_summary`.`date`>='"+moment(parameters.from).format('YYYY-MM-DD HH:mm:ss')+"' AND `bill_summary`.`date`<='"+moment(wholeEnd).format('YYYY-MM-DD HH:mm:ss')+"' THEN `bill_item_info1`.`qty` ELSE 0 END) As `Total_QTY`,"

        let selectProducts="`product`.`product_name` AS `product_name`"
        let selectCategory=   "category.name AS 'categoryName'"
        let queryJoins;
        if (parameters.attr.branch_id != null) {
            queryJoins = " FROM `bill_item_info` AS bill_item_info1 \n" +
                "LEFT JOIN `product` AS `product` ON `bill_item_info1`.`product_id` = `product`.`id`  \n" +
                "INNER JOIN category AS category  ON category.id=product.category_id\n" +
                "INNER JOIN `bill_summary` AS `bill_summary` ON `bill_item_info1`.`bill_id` = `bill_summary`.`id` \n" +
                "WHERE `bill_item_info1`.`bill_id` IN ( SELECT `bill_summary`.`id` AS `bill_id` FROM `bill_summary` AS `bill_summary`\n" +
                "INNER JOIN `user` AS `user` ON `bill_summary`.`cashier_id` = `user`.`id`  \n" +
                "WHERE `bill_summary`.`date` >= '" + moment(parameters.from).format('YYYY-MM-DD HH:mm:ss') + "' AND `bill_summary`.`date` <= '" + moment(wholeEnd).format('YYYY-MM-DD HH:mm:ss') + "' AND user.branch_id = " + parameters.attr.branch_id + "\n" +
                "AND NOT EXISTS(SELECT bill_summary.id As bill_id,bill_item_info.id,bill_item_info.unit_price \n" +
                "FROM bill_return_info AS bill_return_info INNER JOIN bill_item_info AS bill_item_info ON bill_item_info.id = `bill_return_info`.`bill_item_id` INNER JOIN bill_summary AS bill_summary ON bill_item_info.bill_id=bill_summary.id \n" +
                "WHERE bill_summary.date>='" + moment(parameters.from).format('YYYY-MM-DD HH:mm:ss') + "'  AND bill_summary.date<='" + moment(wholeEnd).format('YYYY-MM-DD HH:mm:ss') + "' AND bill_item_info1.id = bill_return_info.bill_item_id)) "
        }else{
            queryJoins = " FROM `bill_item_info` AS bill_item_info1 \n" +
                "LEFT JOIN `product` AS `product` ON `bill_item_info1`.`product_id` = `product`.`id`  \n" +
                "INNER JOIN category AS category  ON category.id=product.category_id\n" +
                "INNER JOIN `bill_summary` AS `bill_summary` ON `bill_item_info1`.`bill_id` = `bill_summary`.`id` \n" +
                "WHERE `bill_item_info1`.`bill_id` IN ( SELECT `bill_summary`.`id` AS `bill_id` FROM `bill_summary` AS `bill_summary`\n" +
                "INNER JOIN `user` AS `user` ON `bill_summary`.`cashier_id` = `user`.`id`  \n" +
                "WHERE `bill_summary`.`date` >= '" + moment(parameters.from).format('YYYY-MM-DD HH:mm:ss') + "' AND `bill_summary`.`date` <= '" + moment(wholeEnd).format('YYYY-MM-DD HH:mm:ss') + "'\n" +
                "AND NOT EXISTS(SELECT bill_summary.id As bill_id,bill_item_info.id,bill_item_info.unit_price \n" +
                "FROM bill_return_info AS bill_return_info INNER JOIN bill_item_info AS bill_item_info ON bill_item_info.id = `bill_return_info`.`bill_item_id` INNER JOIN bill_summary AS bill_summary ON bill_item_info.bill_id=bill_summary.id \n" +
                "WHERE bill_summary.date>='" + moment(parameters.from).format('YYYY-MM-DD HH:mm:ss') + "'  AND bill_summary.date<='" + moment(wholeEnd).format('YYYY-MM-DD HH:mm:ss') + "' AND bill_item_info1.id = bill_return_info.bill_item_id)) "

        }
        let gropByOrderBy=""
        let selectItems=""
        switch (parameters.groupBy) {
            case "CAT":
                gropByOrderBy = " GROUP BY `product`.`category_id` ORDER BY  `category`.`name` ASC"
                selectItems=selectCategory
                break;
            case "PRO":
                gropByOrderBy = " GROUP BY `product`.`id` ORDER BY   `product`.`product_name` ASC"
                selectItems=selectProducts
                break;

        }

        query=query+queryRevTotal +queryQtyTotal+ selectItems + queryJoins + gropByOrderBy

        callBack(query)
    });

}

function getSalesResults(from,end,period,callback)
{

    let attr = {};
    attr.from = new Date(from.setHours(0, 0, 0, 0));
    attr.end = new Date(end.setHours(23, 59, 59, 999));



    billQuery.filterForAnalysis(attr, function (bill_summary) {
        let bills;
        //console.log("bill_summary",bill_summary)
        // results[period.dates[i]].bill_summary = bill_summary;

        if (bill_summary && bill_summary != null) {
            bills = [];
            bill_summary.map(function (x) {
                // console.log("bill_summary id",x.id);
                bills.push(x.id);
            });

            billInfoQuery.findItemsByBillId(bills, attr.from, attr.end, function (items) {
                //  console.log("Bill_items",items)
                // items;
                let bills2;
                if (items && items != null) {
                    bills2 = [];
                    items.map(function (x) {
                        // console.log("id",x.id);
                        bills2.push(x.id);
                    });
                }
                else {
                    bills2 = [];
                }

                while (bills2 === undefined) {
                    require('deasync').runLoopOnce();
                }
                returnItemsQuery.findReturnItems(bills2, attr.end, function (return_products) {

                    dateArry(bill_summary,items,return_products,period,function(result)
                    {
                        var dates= Object.keys(result)
                        resultArry= Object.values(result)
                        // console.log("resultLength",result.length)

                        for(var i=0;i<resultArry.length;i++)
                        {
                            //console.log("result",result[i].items)
                            if(resultArry[i].items)
                            {
                                calculateAmounts(resultArry[i].items, resultArry[i].return_products, function (report) {
                                    result[dates[i]].report = report;

                                    delete  result[dates[i]].bill_summary
                                    delete  result[dates[i]].items
                                    delete  result[dates[i]].return_products

                                });
                            }

                        }
                        callback(result)
                    })


                });
            });
        }
        else {
            bills = [];
        }

        //  console.log(JSON.parse(JSON.stringify(results)))
    })

}


/**
 * pos analysis report
 */
router.post(base.router.getPattern('get.sales_analysis.home') + '/filter/report', function (req, res, next) {
    let from = new Date(req.body.from);
    let end = new Date(req.body.end);
    let report = JSON.parse(req.body.report);
    let dates = JSON.parse(req.body.dates);
    //console.log(dates);
    let categories = JSON.parse(req.body.categories);



    let title = 'SalesReport' + '-' + (from.getMonth() + 1) + '-' + from.getDate() + '_TO_' +
        end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();


    let workbook = excelbuilder.createWorkbook('./public/reports/revenue_reports/', title + '.xlsx');
    let sheet1 = workbook.createSheet('sheet', (dates.length * 2) + 1, 10 * 60 * 60 + 1);

    for (let i = 0; i < dates.length; i++) {
        sheet1.merge({col: (i * 2) + 2, row: 1}, {col: (i * 2) + 3, row: 1});
        sheet1.set((i * 2) + 2, 1, dates[i]);
        sheet1.align((i * 2) + 2, 1, 'center');
    }
    sheet1.set(1, 2, 'products');
    sheet1.align(1, 2, 'center');
    sheet1.font(1, 2, {bold: 'true'});
    for (let i = 0; i < dates.length; i++) {
        sheet1.set((i * 2) + 2, 2, 'Product Quantity');
        sheet1.align((i * 2) + 2, 2, 'center');
        sheet1.set((i * 2) + 3, 2, 'Total Revenue');
        sheet1.align((i * 2) + 3, 2, 'center');
    }

    // console.log(categories);
    let row = 3;
    for (let i = 0; i < categories.length; i++) {
        let category = categories[i + ''];
        ////console.log(category);
        if (report[category.id] && report[category.id] != null) {
            let products = report[category.id];
            let all = products.all;

            for (let j = 0; j < (dates.length * 2) + 1; j++) {
                ////console.log(all[j]);
                if (all[j] && all[j] != null) {
                    sheet1.set(j + 1, row, all[j]);
                }
                else {
                    sheet1.set(j + 1, row, 0);
                }
                sheet1.align(j + 1, row, 'left');
                sheet1.font(j + 1, row, {bold: 'true'});
            }
            row++;

            let keys = Object.keys(products);
            keys.splice(keys.indexOf('all'), 1);
            // console.log(keys);
            for (let m = 0; m < keys.length; m++) {
                let o_product = products[keys[m]];
                for (let j = 0; j < (dates.length * 2 + 1); j++) {
                    if (o_product[j] && o_product[j] != null) {
                        sheet1.set(j + 1, row, o_product[j]);
                    }
                    else {
                        sheet1.set(j + 1, row, 0);
                    }
                    sheet1.align(j + 1, row, 'left');
                }
                row++;
            }
        }
        else {
            sheet1.set(1, row, 'All/' + category.categoryName);
            sheet1.align(1, row, 'left');
            sheet1.font(1, row, {bold: 'true'});
            // console.log(dates.length);
            for (let j = 0; j < dates.length; j++) {
                sheet1.set((j * 2) + 2, row, 0);
                sheet1.align((j * 2) + 2, row, 'left');
                sheet1.set((j * 2) + 3, row, 0);
                sheet1.align((j * 2) + 3, row, 'left');
                sheet1.font((j * 2) + 3, row, {bold: 'true'});
                sheet1.font((j * 2) + 2, row, {bold: 'true'});
            }
            row++;
        }
    }



    // console.log("sssss");
    workbook.save(function (err) {
        if (err && err != null) {
            workbook.cancel();
            console.log(err);
            res.send({status: 500});
        }
        else {
            console.log("Saved");
            res.send({status: 200, link: title + '.xlsx'});
        }
    });
});


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
    ////console.log(attr);
    let endDate = new Date(attr.end);
    endDate = new Date(endDate.setHours(23, 59, 59, 999));
    let startDate = new Date(attr.from);
    startDate = new Date(startDate.setHours(0, 0, 0, 0));
    let dateArray = [];
    let current = startDate;

    while (current <= endDate) {
        dateArray.push(current.toDateString().toString());

        if (attr.period == "YEAR") {
            current = new Date(current.setFullYear(current.getFullYear() + 1));
        }
        else if (attr.period == "MONTH") {
            current = new Date(current.setMonth(current.getMonth() + 1));
        }
        else if (attr.period == "DAY") {

            current = new Date(current.setDate(current.getDate() + 1));
        }

    }
    return dateArray;
};

/**
 * calculate amounts
 * @param products
 * @param return_products
 * @param callback
 */
function calculateAmounts(products, return_products, callback) {


    let report = {};
    for (let i = 0; i < products.length; i++) {
        let item = JSON.parse(products[i]) ;

        if (!report[item.product.categoryId]) {
            report[item.product.categoryId] = {
                total_qty: 0,
                total_revenue: 0
            };
        }
        if (!report[item.product.categoryId][item.productId]) {
            report[item.product.categoryId][item.productId] = {
                qty: 0,
                revenue: 0,
                name: item.product.productName
            }
        }

        let revenue = ((item.qty * item.unitPrice) + (item.qty * item.unitPrice * (item.taxes / 100))
            - (item.qty * item.unitPrice * (item.discount / 100)));

        report[item.product.categoryId][item.productId].qty += item.qty;
        report[item.product.categoryId][item.productId].revenue += revenue;

        report[item.product.categoryId].total_qty += item.qty;
        report[item.product.categoryId].total_revenue += revenue;

    }
    for (let i = 0; i < return_products.length; i++) {
        let ret_item = return_products[i];
        if (report[ret_item.bill_item_info.product.categoryId]) {
            if (report[ret_item.bill_item_info.product.categoryId][ret_item.bill_item_info.productId]) {
                let revenue = ((ret_item.qty * ret_item.bill_item_info.unitPrice)
                    + (ret_item.qty * ret_item.bill_item_info.unitPrice * (ret_item.taxes / 100))
                    - (ret_item.qty * ret_item.bill_item_info.unitPrice * (ret_item.bill_item_info.discount / 100)));

                report[ret_item.bill_item_info.product.categoryId][ret_item.bill_item_info.productId].qty -= ret_item.qty;
                report[ret_item.bill_item_info.product.categoryId][ret_item.bill_item_info.productId].revenue -= revenue;

                report[ret_item.bill_item_info.product.categoryId].total_qty -= ret_item.qty;
                report[ret_item.bill_item_info.product.categoryId].total_revenue -= revenue;

            }
        }
    }


    callback(report);
};


function dateArry(billSummary,itemsData,return_productsData,period,callback){


    // results[period.dates[i]].bill_summary = bill_summary;
    let results={}
    //console.log("date",itemsData[0].dataValues.bill_summary.date)
    // console.log( return_productsData[0])
    for(let j=0;j<period.dates.length;j++)
    {
        let from = new Date(period.dates[j]);
        var end =new Date(from.setHours(0, 0, 0, 0));

        switch (period.period) {
            case "DAY":
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
            case "MONTH":
                end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
            case "YEAR":
                end = new Date(end.getFullYear(), 11, 31);
                end = new Date(end.setHours(23, 59, 59, 999));
                break;
        }


        from=  Date.parse(from)
        end=  Date.parse(end)

        results[period.dates[j]] = {};
        bill_summary=[]
        items=[]
        return_products=[]

        for(var i=0;i<billSummary.length;i++)
        {

            var billSummary_date=Date.parse(billSummary[i].dataValues.date)


            if((billSummary_date>=from)&&(billSummary_date<=end))
            {

                bill_summary.push(JSON.stringify(billSummary[i]))

            }
        }

        results[period.dates[j]].bill_summary = bill_summary;
        //console.log("items.length",items.length)
        for(var p=0;p<itemsData.length;p++)
        {
            // console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")

            var items_date=Date.parse(itemsData[p].dataValues.bill_summary.date)
            //console.log("from",from)
            //console.log("end",end)
            //console.log("items_date",items_date)
            if((items_date>=from)&&(items_date<=end))
            {
                items.push(JSON.stringify(itemsData[p]))
            }
        }
        results[period.dates[j]].items = items;
        if(return_productsData)
        {
            for(var p=0;p<return_productsData.length;p++)
            {

                var return_date=Date.parse(return_productsData[p].dataValues.bill_summary.date);

                if((return_date>=from)&&(return_date<=end))
                {
                    return_products.push(JSON.stringify(itemsData[p])) ;
                }
            }
            results[period.dates[j]].return_products = return_products;
        }
    }
    callback(results)
}





module.exports = router;