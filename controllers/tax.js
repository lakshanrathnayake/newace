/**
 * Created by shashika on 2/15/2018.
 */

const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
let imageConfig = require('../images.config.json');

/**
 * Add tax page
 */
router.get(base.router.getPattern('get.tax.add'), function (req, res, next) {
    let currentRoute = 'get.tax.add';
    let profile =JSON.stringify(imageConfig.images.profile.file)
    let logo=JSON.stringify(imageConfig.images.logo.file)
    res.render('backend/tax/admin_add_tax', {route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});
});

/**
 * Add tax to database
 */
router.post(base.router.getPattern('post.tax.add'), function (req, res, next) {
    req.body.modelName = 'tax_type';
    let taxQuery = mysqlDB.getQuery('tax_type');
    let tax = mysqlDB.getModel('tax_type');

    taxQuery.searchTaxByName(req.body.taxName, function (response) {
        if(response.length > 0) {
            res.send({status: 500});
        }
        else {
            tax['taxName'] = req.body.taxName;
            tax['code'] = req.body.taxName.toUpperCase();

            taxQuery.addTaxType(tax, function (output) {
                res.send({status: 200});
            });
        }
    });


});

/**
 *tax list page
 */
router.get(base.router.getPattern('get.tax.list'), function (req, res, next) {
    base.listFilter('taxType', req, ['taxName'], function (list) {
        if (list !== undefined){
            let currentRoute = 'get.tax.list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/tax/admin_list_tax', {results: list, route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});
        }else{
            res.send(500);
        }
    });


});

/**
 * tax edit page
 */
router.get(base.router.getPattern('get.tax.edit'), function (req, res, next) {
    base.listFilter('taxType', req, ['id', 'taxName'], function (list) {
        if (list !== undefined){
            let currentRoute = 'get.tax.edit';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/tax/admin_edit_tax', {results: list, route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});

        }else{
            res.send(500);

        }
    });


});

/**
 * Update tax name
 */
router.post(base.router.getPattern('post.tax.update'), function (req, res, next) {

    let tax = mysqlDB.getModel('tax_type');
    let taxQuery = mysqlDB.getQuery('tax_type');

    tax.id   =  req.body.id;
    tax.taxName = req.body.taxName;
    tax.code = req.body.taxName.toUpperCase();

    taxQuery.searchTaxByName(req.body.taxName, function (response) {
        if(response.length > 0) {
            if(response.length == 1 && response[0].id == tax.id) {

                taxQuery.updateTaxType(tax, function (output) {
                    // res.redirect('/tax' + base.router.getPattern('get.tax.list'));
                    res.send({status: 200});
                });
            }
            else {
                res.send({status: 500});
            }
        }
        else {
            taxQuery.updateTaxType(tax, function (output) {
                // res.redirect('/tax' + base.router.getPattern('get.tax.list'));
                res.send({status: 200});
            });
        }
    });




});


module.exports = router;
