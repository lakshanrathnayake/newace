/**
 * Created by tharindu on 2/15/2018.
 */

const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const imageConfig = require('../images.config.json');

/**
 * Add category page
 */
router.get(base.router.getPattern('get.category.add'), function(req, res, next) {
    let currentRoute = 'get.category.add';
    let profile =JSON.stringify(imageConfig.images.profile.file)
    let logo=JSON.stringify(imageConfig.images.logo.file)
    res.render('backend/category/admin_add_category',{route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo}});
});

/**
 * Add category to database
 */
router.post(base.router.getPattern('post.category.add'), function (req, res, next) {
    req.body.modelName = 'category';
    let categoryQuery = mysqlDB.getQuery('category');
    let category = mysqlDB.getModel('category');

    console.log("sssss")

    // check if category exist
    categoryQuery.searchCategoriesByName(req.body.name,function (response) {
        if(response.length > 0) {
            res.send({status: 500});
        }
        else {
            category['categoryName']  =req.body.name;

            categoryQuery.addCategory(category,function (output) {
                res.send({status: 200})
            });

        }
    });


});

/**
 *Category list page
 */
router.get(base.router.getPattern('get.category.list'), function(req, res, next) {

    // req.query.state = 1;
    base.listFilter('Category', req, ['name','state'], function (list) {

        if (list !== undefined){
            let currentRoute = 'get.category.list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/category/admin_list_category',{results: list,route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo}});

        }else{
            res.send(500);
        }
    });


});

/**
 * category edit page
 */
router.get(base.router.getPattern('get.category.edit'), function(req, res, next) {
    base.listFilter('Category', req, ['id', 'name'], function (list) {
        if (list !== undefined){
            let currentRoute = 'get.category.edit';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/category/admin_edit_category', {results: list,route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo}});

        }else{
            res.send(500);
        }
    });

});

/**
 * Update category name
 */
router.post(base.router.getPattern('post.category.update'), function(req, res, next) {

    req.body.modelName = 'category';
    req.body.id = parseInt(req.body.id);

    let category = base.requestToModel(req.body);
    let categoryQuery = mysqlDB.getQuery('category');

    categoryQuery.searchCategoriesByName(req.body.categoryName,function (response) {
        if(response.length > 0) {
            if (response[0].id === category.id && response.length === 1) {
                category.categoryName = req.body.categoryName;

                categoryQuery.updateCategory(category, function (output) {
                    res.send({status: 200});
                });
            } else {
                res.send({status: 500});
            }

        }
        else {
            category.categoryName  =req.body.categoryName;

            categoryQuery.updateCategory(category, function (output) {
                res.send({status: 200});
            });

        }
    });


});


router.post(base.router.getPattern('post.category.state-update'), function (req, res) {
    req.body.modelName = 'category';
    req.body.id = parseInt(req.body.id);

    let category = base.requestToModel(req.body);
    let categoryQuery = mysqlDB.getQuery('category');

    category.state = 1;
    if(req.body.action === "inactivate") {
        category.state = 0;
    }
    categoryQuery.updateCategory(category, function (output,error) {
        if(output){
            res.send({status: 200})
        }
        if(error){
            console.log('errr in category',error)
        }
     

    });

});

module.exports = router;
