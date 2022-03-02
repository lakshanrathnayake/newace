/**
 * Created by tharindu on 2/14/2018.
 *
 */
const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const taxQuery = mysqlDB.getQuery('tax_type');
const fileUpload = require('express-fileupload');
const config = require('../config.json');
const base64ToImage = require('base64-to-image');
const categoryModel = mysqlDB.getModel('category');
const imageConfig = require('../images.config.json');

router.use(fileUpload());

const Sequelize = require('sequelize');

const sequelizeObject = new Sequelize({
    database: config.mysql.database,
    username: config.mysql.username,
    password: config.mysql.password,
    dialect: 'mysql',
    pool: {
        max: config.mysql.maxPoolSize,
        min: config.mysql.minPoolSize,
        acquire: 30000,
        idle: 1000
    },
    define: {
        timestamps: false
    }
});

/**
 * Add product page
 */
router.get(base.router.getPattern('get.product.add'), function (req, res, next) {
    let currentRoute = 'get.product.add';
    let results = {};
    mysqlDB.getModel('product_template').findAll({
        attributes: ['id', 'type', 'variation']
    }).then(function (temps) {
        results.templates = temps;
        mysqlDB.getModel('category').findAll({
            attributes: ['id', 'categoryName']
        }).then(function (cat) {
            results.categories = cat;
            mysqlDB.getModel('tax_type').findAll({
                attributes: ['id', 'taxName']
            }).then(function (tax) {
                results.taxs = tax;
                //res.send(results);
                let defaultProductImage = JSON.stringify(imageConfig.images.defaultProductImage.file)
                let logo = JSON.stringify(imageConfig.images.logo.file)
                let upload = JSON.stringify(imageConfig.images.upload.file)
                let error404 = JSON.stringify(imageConfig.images.error404.file)

                res.render('backend/product/admin_add_product', {
                    images: {defaultProductImage: defaultProductImage, logo: logo, upload: upload, error404: error404},
                    route: currentRoute,
                    results: results, user: base.getCurrentUser(req)
                });
            });
        });
    });
});

/**
 * img upload
 * @param req
 * @param res
 * @param next
 */
let imageUpload = function (req, res, next) {
    if (!req.files)
        next();
    if (req.files) {
        if (req.files.sampleFile) {
            let sampleFile = req.files.sampleFile;
            sampleFile.mv('./public/uploads/products/' + sampleFile.name, function (err) {
                if (err) {
                    let error500 = JSON.stringify(imageConfig.images.error500.file)

                    return res.render('errors/500', {
                        message: 'Image Upload Error',
                        error: {status: 500},
                        images: {profile: profile, logo: logo, error500: error500}
                    });
                } else {
                    req.body.imageUrl = sampleFile.name;
                    next();
                }
            });
        } else {
            next();
        }
    }

};

/**
 * Add product page
 */
router.post(base.router.getPattern('post.product.add'), function (req, res, next) {

    let base64Str = req.body.imageBase;
    let image64Name = req.body.imageName;

    if (base64Str === undefined || base64Str == null && base64Str || base64Str === 'undefined ' || base64Str === '') {
        image64Name = 'null';
    } else {

        let path = './public/uploads/products/';
        let optionalObj = {'fileName': image64Name};
        base64ToImage(base64Str, path, optionalObj);
    }

    let obj = JSON.parse(req.body.formData);
    let objectKeys = Object.keys(JSON.parse(req.body.formData));

    let products = [];
    for (let i = 0; i < (objectKeys.length - 1) / 11; i++) {
        products.push({
            id: null,
            barcode: obj['barcode[' + i + ']'],
            partNumber: obj['mfno[' + i + ']'],
            productName: obj['name[' + i + ']'],
            description: obj['description[' + i + ']'],
            categoryId: (obj['category[' + i + ']'] && obj['category[' + i + ']'] !== "") ? parseInt(obj['category[' + i + ']']) : 0,
            manufacturerPrice: (obj['mf_price[' + i + ']'] && obj['mf_price[' + i + ']'] !== "") ? parseInt(obj['mf_price[' + i + ']']) : 0,
            cost: (obj['cost[' + i + ']'] && obj['cost[' + i + ']'] !== "") ? parseFloat(obj['cost[' + i + ']']) : 0,
            sellingPrice: (obj['selling_price[' + i + ']'] && obj['selling_price[' + i + ']'] !== "") ? parseFloat(obj['selling_price[' + i + ']']) : 0,
            minOrderQuantity: (obj['min_quantity[' + i + ']'] && obj['min_quantity[' + i + ']'] !== "") ? parseFloat(obj['min_quantity[' + i + ']']) : 0,
            reorderLevel: (obj['reorder_level[' + i + ']'] && obj['reorder_level[' + i + ']'] !== "") ? parseFloat(obj['reorder_level[' + i + ']']) : 0,
            imageUrl: image64Name,
            tax: obj.taxs,
            statusId: 1,
            state: 1
        });
    }

    let productQuery = mysqlDB.getQuery('product');
    productQuery.bulkAdd(products, function (results, err) {
        if (err != null) {
            res.send({status: 500});
        } else {
            res.send(results);
        }

    });
});

/**
 * Edit product page
 */
router.get(base.router.getPattern('get.product.edit'), function (req, res, next) {
    let currentRoute = 'get.product.edit';
    let tax;
    base.listFilter('product', req, ['id'], function (list) {
        if (list && list.length > 0) {
            list[0].tax = JSON.parse(list[0].tax);
            tax = list[0].tax;
        }

        taxQuery.getTaxTypes(function (taxTypeData) {
            categoryModel.findAll().then(categoryResult => {
                let defaultProductImage = JSON.stringify(imageConfig.images.defaultProductImage.file)
                let logo = JSON.stringify(imageConfig.images.logo.file)
                let upload = JSON.stringify(imageConfig.images.upload.file)
                res.render('backend/product/admin_edit_product', {
                    results: list,
                    images: {defaultProductImage: defaultProductImage, logo: logo, upload: upload},
                    route: currentRoute,
                    tax: tax,
                    user: base.getCurrentUser(req),
                    categories: categoryResult,
                    taxtypes: taxTypeData
                });
            });
        });

    });

});


/**
 * update product action
 */
router.post(base.router.getPattern('post.product.update'), imageUpload, function (req, res, next) {
    req.body.modelName = 'product';
    req.body.id = parseInt(req.body.pid);
    req.body.categoryId = parseInt(req.body.categoryId);
    let product = base.requestToModel(req.body);
    let productQuery = mysqlDB.getQuery('product');
    productQuery.updateProduct(product, function (output) {
        res.redirect('/product' + base.router.getPattern('get.product.list'));
    });

});

/**
 * delete product action
 */
router.get(base.router.getPattern('post.product.delete'), function (req, res, next) {
    let product = require('../models/mysql/product')(sequelizeObject, Sequelize);
    let productQuery = mysqlDB.getQuery('product');
    product.id = (req.query.id);
    product.state = 0;
    productQuery.deleteProduct(product, function (output) {
        res.redirect('/product' + base.router.getPattern('get.product.list'));
    });

});

/**
 * activate product action
 */
router.get(base.router.getPattern('post.product.activate'), function (req, res, next) {
    let product = require('../models/mysql/product')(sequelizeObject, Sequelize);
    let productQuery = mysqlDB.getQuery('product');
    product.id = (req.query.id);
    product.state = 1;
    productQuery.activateProduct(product, function (output) {
        res.redirect('/product' + base.router.getPattern('get.product.inactive_list'));
    });

});

/**
 * List product page
 */
router.get(base.router.getPattern('get.product.list'), function (req, res, next) {
    let product = mysqlDB.getModel('product');
    let category = mysqlDB.getModel('category');
    let productQuery = mysqlDB.getQuery('product');
    let categoryQuery = mysqlDB.getQuery('category');

    // product.state = 1;
    // product.barcodePart = '';
    // product.productNamePart = '';
    // product.categoryNamePart = '';
    // product.offset = 0;
    // product.limit = 25;

    // productQuery.filterProductByBarcodeProductName(product, function (output) {
    categoryQuery.getAllCategories(category, function (categoryResult) {
        let categoryResults = categoryResult;
        let currentRoute = 'get.product.list';
        let profile = JSON.stringify(imageConfig.images.profile.file)
        let logo = JSON.stringify(imageConfig.images.logo.file)

        res.render('backend/product/admin_product_list', {
            results: [],
            route: currentRoute,
            user: base.getCurrentUser(req),
            categories: categoryResults,
            images: {profile: profile, logo: logo}
        });
    })
    // });
});

/**
 * inactive product list page
 */
router.get(base.router.getPattern('get.product.inactive_list'), function (req, res, next) {
    let product = mysqlDB.getModel('product');
    let category = mysqlDB.getModel('category');
    let productQuery = mysqlDB.getQuery('product');
    let categoryQuery = mysqlDB.getQuery('category');

    // product.state = 0;
    // product.barcodePart = '';
    // product.productNamePart = '';
    // product.categoryNamePart = '';
    // product.offset = 0;
    // product.limit = 25;

    // productQuery.filterProductByBarcodeProductNameInactive(product, function (output) {
    categoryQuery.getAllCategories(category, function (categoryResult) {
        let categoryResults = categoryResult;
        let currentRoute = 'get.product.inactive_list';
        let profile = JSON.stringify(imageConfig.images.profile.file)
        let logo = JSON.stringify(imageConfig.images.logo.file)

        res.render('backend/product/admin_inactive_product_list', {
            results: [],
            route: currentRoute,
            user: base.getCurrentUser(req),
            categories: categoryResults,
            images: {profile: profile, logo: logo}


        });
    })
    // });

});

/**
 * search by barcode name part
 */
router.get(base.router.getPattern('get.product.search_by_barcode_product_name'), function (req, res, next) {

    let product = mysqlDB.getModel('product');
    let productQuery = mysqlDB.getQuery('product');

    product.state = req.query.state;
    product.barcodePart = req.query.barcodePart;
    product.productNamePart = req.query.productNamePart;

    product.categoryNamePart = '';
    if (req.query.categoryNamePart !== 0) {
        product.categoryNamePart = req.query.categoryNamePart;
    }

    product.offset = req.query.offset;
    product.limit = req.query.limit;

    productQuery.filterProductByBarcodeProductName(product, function (output) {
        res.send(output);
    });
});


/**
 * search by barcode name part
 */
router.get(base.router.getPattern('get.product.search_by_barcode_inactive_product_name'), function (req, res, next) {

    let product = mysqlDB.getModel('product');
    let productQuery = mysqlDB.getQuery('product');

    product.state = req.query.state;
    product.barcodePart = req.query.barcodePart;
    product.productNamePart = req.query.productNamePart;

    product.categoryNamePart = '';
    if (req.query.categoryNamePart !== 0) {
        product.categoryNamePart = req.query.categoryNamePart;
    }

    product.offset = req.query.offset;
    product.limit = req.query.limit;

    productQuery.filterProductByBarcodeInactiveProductName(product, function (output) {
        res.send(output);
    });
});


/**
 * Bulk delete product
 */
router.post(base.router.getPattern('post.product.bulkdelete'), function (req, res, next) {
    let product_ids = req.body.product_ids;
    let stores_query = mysqlDB.getQuery('product');
    stores_query.bulkDeleteProducts(product_ids, function (output) {
        res.send(output);
    });

});


module.exports = router;