/**
 * Created by tharindu on 2/16/2018.
 */

const express = require('express');
const router = express.Router();
const base = require('./base')();
const apiHelper = require('../helpers/api_helper');
const mysqlDb = require('../models/mysql');
const logs = require('./logs');

/**
 * load login page
 */
router.get('/', function (req, res, next) {
    res.render('login');
});

/**
 * load logout
 */
router.get('/logout', function (req, res, next) {
    if (req.session.username && req.cookies.pos_user) {
        logs.logs.insertUserLoginLog('info','LOGOUT',{username:req.session.username,role:req.session.role,branch:req.session.branch,message:'LOGOUT SUCCESS'});
        req.session.username = null;
        req.session.role = null;
        res.clearCookie('pos_user');
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

/**
 * load first page
 */
router.post(base.router.getPattern("get.login.log"), function (req, res, next) {

    let user = mysqlDb.getModel('user');
    let branch = mysqlDb.getModel('branch');
    user.username = req.body.username;
    user.password = req.body.password;


    mysqlDb.getQuery('user').verifyUser(user,branch,function (output) {

        if(output===false){
            logs.logs.insertUserLoginLog('warn','LOGIN',{username:user.username,role:"",branch:"",message:'LOGIN FAILED'});
            res.redirect('/');
        }else{
            req.session.branch = output.dataValues.branchId;
            req.session.role = output.dataValues.roleId;
            req.session.status = output.dataValues.statusId;
            req.session.username = output.dataValues.username;
            req.session.user_id = output.dataValues.id;
            req.session.branchName = output.dataValues.branch.branchName;
            req.session.address = output.dataValues.branch.address;
            req.session.telephone = output.dataValues.branch.telephone;
            //console.log(req.session);
            req.cookies.pos_user = user;
            logs.logs.insertUserLoginLog('info','LOGIN',{username:output.dataValues.username,role:output.dataValues.roleId,branch:output.dataValues.branchId,message:'LOGIN SUCCESS'});
            apiHelper.createAccessToken(req.session.user_id,function(response){
                req.session.token = "";
                if(response.status === 200){

                    req.session.token = response.token;
                }
                switch (output.dataValues.roleId) {
                    case 1:
                        res.redirect('/home/admin');
                        break;
                    case 2:
                        res.redirect('/home/manager');
                        break;
                    case 3:
                        res.redirect('/pos/session');
                        break;
                    case 4:
                        res.redirect('/home/super_admin');
                        break;
                    default:
                        res.redirect('/');
                }
            });
        }
    });

});

module.exports = router;