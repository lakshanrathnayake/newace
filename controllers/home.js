/**
 * Created by tharindu on 2/14/2018.
 */

const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const imageConfig = require('../images.config.json');

/**
 * Add admin home page
 */
router.get(base.router.getPattern('get.home.admin'), function (req, res, next) {
    let results = {};
    let transferManagementSummary = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummary.destination = req.session.branch;
    transferManagementSummary.source = req.session.branch;

    transferManagementSummaryQuery.getStoreInCount(transferManagementSummary, function (output) {

        results.storeInCount = output;
        transferManagementSummaryQuery.getOrderRequestCount(transferManagementSummary, function (output1) {

            results.orderRequestCount = output1;
            transferManagementSummaryQuery.getTransferRejectCount(transferManagementSummary, function (output2) {

                results.transferRejectCount = output2;

                let currentRoute = 'get.home.admin';
                let profile =JSON.stringify(imageConfig.images.profile.file)
                let logo=JSON.stringify(imageConfig.images.logo.file)
                return res.render('backend/home/admin_home', {results: results, route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});
            });
        });
    });

});

/**
 * List manager home page
 */
router.get(base.router.getPattern('get.home.manager'), function (req, res, next) {
    let results = {};
    let transferManagementSummary = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummary.destination = req.session.branch;
    transferManagementSummary.source = req.session.branch;


    transferManagementSummaryQuery.getStoreInCount(transferManagementSummary, function (output) {
        results.storeInCount = output;
        transferManagementSummaryQuery.getOrderRequestCount(transferManagementSummary, function (output1) {
            results.orderRequestCount = output1;
            transferManagementSummaryQuery.getTransferRejectCount(transferManagementSummary, function (output2) {
                results.transferRejectCount = output2;
            })
        })
        if (results !== undefined || Object.keys(results).length < 3){
            let currentRoute = 'get.home.manager';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/home/manager_home', {results: results, route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});

        }else{
            res.send(500);

        }
    });
});

/**
 * Add super admin home page
 */
router.get(base.router.getPattern('get.home.super_admin'), function (req, res, next) {
    let results = {};
    let transferManagementSummary = mysqlDB.getModel('transfer_management_summary');
    let transferManagementSummaryQuery = mysqlDB.getQuery('transfer_management_summary');

    transferManagementSummary.destination = req.session.branch;
    transferManagementSummary.source = req.session.branch;

    transferManagementSummaryQuery.getStoreInCount(transferManagementSummary, function (output) {

        results.storeInCount = output;
        transferManagementSummaryQuery.getOrderRequestCount(transferManagementSummary, function (output1) {

            results.orderRequestCount = output1;
            transferManagementSummaryQuery.getTransferRejectCount(transferManagementSummary, function (output2) {

                results.transferRejectCount = output2;

                let currentRoute = 'get.home.super_admin';
                let profile =JSON.stringify(imageConfig.images.profile.file)
                let logo=JSON.stringify(imageConfig.images.logo.file)
                return res.render('backend/home/super_admin_home', {results: results, route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});
            });
        });
    });

});

module.exports = router;