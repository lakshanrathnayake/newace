/**
 * Created by hariharan on 3/12/18.
 */

let express = require('express');
let router = express.Router();
let base = require('./base')();
let mysqlDB = require('../models/mysql');
let productQuery = mysqlDB.getQuery('product_template');
let imageConfig = require('../images.config.json');
/**
 * controller home page
 */

router.get(base.router.getPattern('get.control.add.template'), function (req, res) {
   
    let currentRoute = 'get.control.add.template';
   let profile =JSON.stringify(imageConfig.images.profile.file)
    let logo=JSON.stringify(imageConfig.images.logo.file)
    res.render('backend/control/add_template', {route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});
});

/**
 * controller add template page
 */
router.post(base.router.getPattern('get.control.add.template'), function (req, res) {
    let obj = JSON.parse(req.body.temps);
   // console.log('objects',obj)
    let templates = [];
  //  console.log('templates',templates)
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        templates.push({
            id: null,
            type: keys[i],
            variation: JSON.stringify(obj[keys[i]]),
            state: 1
        });
    }
    productQuery.bulkAdd(templates, function (results) {
        res.send(results);
    });
});

/**
 * controller edit template page
 */
router.post(base.router.getPattern('get.control.add.template') + '/edit', function (req, res) {
    let id = req.body.temp_id;
    let obj = JSON.parse(req.body.temps);
    let template;
    let keys = Object.keys(obj);
    template = {
        type: keys[0],
        variation: JSON.stringify(obj[keys[0]])
    };
    productQuery.updateTemplate(id,template, function (results) {
        if(results != null && results){
            res.send({status:200});
        }
        else{
            res.send({status:500});
        }
    });
});

/**
 * controller delete template page
 */
router.post(base.router.getPattern('get.control.add.template') + '/delete', function (req, res) {
    let id = req.body.id;
    productQuery.deleteTemplate(id,function (status) {
        if(status){
            res.send({status:200});
        }
        else{
            res.send({status:500});
        }
    });
});

/**
 * controller add template page
 */
router.get(base.router.getPattern('get.control.add.template') + '/edit/:temp_id', function (req, res) {
    let temp_id = req.params.temp_id;
    let currentRoute = 'get.control.add.template';
    productQuery.searchTemplate(temp_id, function (template) {
        let results = [];
        if (template != null && template) {
            results = template;
            results.variation = JSON.parse(results.variation);
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/control/edit_template', {
                route: currentRoute,
                user: base.getCurrentUser(req),
                images:{profile:profile,logo:logo},
                template: JSON.parse(JSON.stringify(results))
            });
        }
        else {
            res.redirect(base.router.getPattern('get.control.list.template'));
        }
    });
});

/**
 * controller list template page
 */
router.get(base.router.getPattern('get.control.list.template'), function (req, res) {
    let currentRoute = 'get.control.list.template';
    let productQuery = mysqlDB.getQuery('product_template');
    let templates = [];
    productQuery.findTemplates(function (template) {
        if (template != null && template) {
            for (let i = 0; i < template.length; i++) {
                templates.push({
                    id: template[i].id,
                    type: template[i].type,
                    variation: JSON.parse(template[i].variation)
                });
            }
        }
        let profile =JSON.stringify(imageConfig.images.profile.file)
        let logo=JSON.stringify(imageConfig.images.logo.file)
        res.render('backend/control/list_template', {
            route: currentRoute,
            user: base.getCurrentUser(req), templates: templates,
            images:{profile:profile,logo:logo}
        });
    });

});

module.exports = router;