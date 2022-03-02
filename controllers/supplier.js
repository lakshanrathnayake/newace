/**
 * Created by tharindu on 2/14/2018.
 */

const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
let imageConfig = require('../images.config.json');

/**
 * Add supplier page
 */
router.get(base.router.getPattern('get.supplier.add'), function (req, res, next) {
    let currentRoute = 'get.supplier.add';
    let profile =JSON.stringify(imageConfig.images.profile.file)
    let logo=JSON.stringify(imageConfig.images.logo.file)
    let suplier=JSON.stringify(imageConfig.images.suplier.file)
    res.render('backend/supplier/add_supplier',{route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo,suplier:suplier}});
});

/**
 * List supplier page
 */
router.get(base.router.getPattern('get.supplier.list'), function (req, res, next) {
    base.listFilter('supplier', req, ['supplierName','state'], function (list) {
        if (list !== undefined){
            let currentRoute = 'get.supplier.list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/supplier/supplier_list', {results: list, route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo}});

        }else{
            res.send(500);
        }
    });

});


/**
 * add supplier to database
 */
router.post(base.router.getPattern('post.supplier.post'), function (req, res, next) {
    req.body.modelName = 'supplier';
    let supplier = base.requestToModel(req.body);
    let supplierQuery = mysqlDB.getQuery('supplier');
    supplierQuery.addSupplier(supplier, function (output) {
        res.redirect('/Supplier' + base.router.getPattern('get.supplier.add'));
    });
});


/**
 * render supplier edit page
 */
router.get(base.router.getPattern('get.supplier.edit'), function (req, res, next) {
    base.listFilter('supplier', req, ['id'], function (list) {
        if (list !== undefined){
            let currentRoute = 'get.supplier.edit';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/supplier/edit_supplier', {results: list, route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo}});
        }else{
            res.send(500);
        }
    });

});

/**
 * update supplier action
 */
router.post(base.router.getPattern('post.supplier.update'), function (req, res, next) {
    req.body.modelName = 'supplier';
    req.body.id = parseInt(req.body.id[0]);
    let supplier = base.requestToModel(req.body);
    let supplierQuery = mysqlDB.getQuery('supplier');
    supplierQuery.updateSupplier(supplier, function (output) {
        res.send(200);
    });

});

/**
 * supplier delete action
 */
router.post(base.router.getPattern('post.supplier.delete'), function (req, res, next) {
    var supplierQuery = mysqlDB.getQuery('supplier');
    var supplier =   mysqlDB.getModel('supplier');
    supplier.id  = parseInt(req.body.id);
    supplier.state = 0;
    console.log('supplier new',supplier)
    supplierQuery.deleteSupplier(supplier,function (output) {
        res.send(200);
    });

});

module.exports = router;