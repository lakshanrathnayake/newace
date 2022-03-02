/**
 * Created by tharindu on 2/14/2018.
 */
const express = require('express');
const router = express.Router();
const base = require('./base')();
const imageConfig = require('../images.config.json');
const mysqlDB = require('../models/mysql');


/**
 * Add customer page
 */
router.get(base.router.getPattern('get.customer.add'), function(req, res, next) {
    let profile =JSON.stringify(imageConfig.images.profile.file)
    let logo=JSON.stringify(imageConfig.images.logo.file)
    res.render('backend/customer/add_customer',{images:{profile:profile,logo:logo}});
});

/**
 * List customer page
 */
router.get(base.router.getPattern('get.customer.list'), function(req, res, next) {
    let currentRoute = 'get.customer.list';
    req.query.state =1;
    base.listFilter('Customer', req, ['customer'], function (list) {

        if (list !== undefined){
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/customer/admin_customer_list.twig', {results: list, route:currentRoute,user:base.getCurrentUser(req),images:{profile:profile,logo:logo}});

        }else{
            res.send(500);

        }
    });

});


/**
 * render customer edit page
 */
router.get(base.router.getPattern('get.customer.edit'), function (req, res, next) {
    base.listFilter('Customer', req, ['id'], function (list) {
        if (list !== undefined) {
            let currentRoute = 'get.customer.edit';
            let profile = JSON.stringify(imageConfig.images.profile.file)
            let logo = JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/customer/admin_edit_customer', {
                results: list,
                route: currentRoute,
                user: base.getCurrentUser(req),
                images: {profile: profile, logo: logo}
            });

        } else {
            res.send(500);

        }
    });


});


/**
 * update customer action
 */
router.post(base.router.getPattern('post.customer.update'), function (req, res, next) {
    let customer = mysqlDB.getModel('customer');
    let customerQuery = mysqlDB.getQuery('customer');

    customer.id = parseInt(req.body.id);
    customer.customerName = req.body.customerName;
    customer.email = req.body.email;
    customer.telephone = req.body.telephone;
    customer.address = req.body.address;
    console.log('customer update',req.body)
    //validate customer by email
   // customerQuery.searchCustomerByEmail(req.body.email, function (response) {
     //   if(response && response.length === 0) {
          //  customerQuery.updateCustomer(customer, function (output) {
           //     res.send(200);
       //     });
       // }else {
        //   if((typeof response[0]!=='undefined') && (response[0].id == customer.id)){
                customerQuery.updateCustomer(customer, function (output) {
                    res.send(200);
                });
         //   }else{
                 
              //  res.send({status: 500});
          //  }
      //  }
   // });


});

module.exports = router;