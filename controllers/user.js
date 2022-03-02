/**
 * Created by tharindu on 1/12/2018.
 */
const mysqlDB = require('../models/mysql');
const userStatusQuery = mysqlDB.getQuery('user_status');
const userRolesQuery = mysqlDB.getQuery('user_role');
const userBranchQuery= mysqlDB.getQuery('branch');
const express = require('express');
const router = express.Router();
const base = require('./base')();
const config = require('../config.json');
const imageConfig = require('../images.config.json');

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
let userNew  = require('../models/mysql/user')(sequelizeObject, Sequelize);


/**
 * Add users page
 */
router.get(base.router.getPattern('get.user.add'), function (req, res, next) {
    let currentRoute = 'get.user.add';
    userBranchQuery.getBranches(function (branchData) {
        let branchDataUser = branchData;
        userRolesQuery.getUserRoles(function(userRoleData){
            let userRoleDataCurrent=userRoleData;
            userStatusQuery.getUserStatuses(function(userData)
            {
                let profile =JSON.stringify(imageConfig.images.profile.file)
                let logo=JSON.stringify(imageConfig.images.logo.file)
                res.render('backend/user/admin_add_user', {route: currentRoute, user: base.getCurrentUser(req),user_role:userRoleDataCurrent,branches:branchDataUser, user_status:userData,images:{profile:profile,logo:logo}});
            });
        });
    });




});

/**
 * Search users page
 */
router.get(base.router.getPattern('get.user.list'), function (req, res, next) {

  //  req.query.state = 1;
    base.listFilter('User', req, ['username','state', 'branch', 'role'], function (list) {

        if (list !== undefined){
            let currentRoute = 'get.user.list';
            let profile =JSON.stringify(imageConfig.images.profile.file)
            let logo=JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/user/admin_user_list', {results: list, route: currentRoute, user: base.getCurrentUser(req),images:{profile:profile,logo:logo}});
        }else{
            res.send(500);

        }
    });


});


/**
 * add users to database
 */
router.post(base.router.getPattern('post.user.post'), function (req, res, next) {
    req.body.modelName = 'user';
    let user = req.body;
    let userQuery = mysqlDB.getQuery('user');

    let username = req.body.username;

    userQuery.searchUserByUsername(username, function (response) {
        if(response.length > 0) {
            res.send({status: 500});
        } else {
            console.log('user')
            userQuery.addUser(user, function (output) {
                res.send({status: 200, model:output});
            });
        }
    });
});


/**
 * render user edit page
 */
router.get(base.router.getPattern('get.user.edit'), function (req, res) {

    base.listFilter('User', req, ['id', 'branch', 'role'], function (list) {

        userBranchQuery.getBranches(function (branchData) {
            let branchDataUser=branchData;

            userRolesQuery.getUserRoles(function(userRoleData){
                let userRoleDataCurrent=userRoleData;

                userStatusQuery.getUserStatuses(function(userData)
                {
                    let profile =JSON.stringify(imageConfig.images.profile.file)
                    let logo=JSON.stringify(imageConfig.images.logo.file)
                    res.render('backend/user/admin_edit_user', {results: list,user_status:userData,branches:branchDataUser, user: base.getCurrentUser(req),user_role:userRoleDataCurrent,images:{profile:profile,logo:logo}});
                });
            });
        });
    });
});


/**
 * update user action
 */
router.post(base.router.getPattern('post.user.update'), function (req, res, next) {


    let pwOperations = require('../helpers/password_operations');

    let user = mysqlDB.getModel('user');
    let userQuery = mysqlDB.getQuery('user');

    userQuery.searchUserByUsername(req.body.username, function (resp) {
        if(resp != null){
            if( (resp.length == 0) || (resp.length ==1 && resp[0].id == req.body.id) ) {
                userQuery.findUserById(parseInt(req.body.id), function (response) {
                    if(response == null) {
                        res.send({status: 500});
                    }else {
                        let _user = response;
                        _user.id  = parseInt(req.body.id);
                        _user.fullName   =  req.body.fullName;
                        _user.username  =  req.body.username;
                        _user.branchId  = parseInt(req.body.branchId);
                        _user.roleId  =  parseInt(req.body.roleId);
                        _user.statusId  =  parseInt(req.body.statusId);
                        _user.state =  1;
                        if(req.body.new_password.length > 0) {
                            pwOperations.encryptPassword(req.body.new_password, function (output) {
                                _user.password = output;
                                user.update(JSON.parse(JSON.stringify(_user)), {where: {id: _user.id}}).then(function () {
                                    res.send({status: 200});
                                });
                            });
                        }else {
                            user.update(JSON.parse(JSON.stringify(_user)), {where: {id: _user.id}}).then(function (returnModel) {
                                res.send({status: 200});
                            });
                        }
                    }
                });
            }
            else {
                res.send({status: 406});
            }
        }else {
            userQuery.findUserById(parseInt(req.body.id), function (response) {
                if(response == null) {
                    res.send({status: 500});
                }else {
                    let _user = response;
                    _user.id  = parseInt(req.body.id);
                    _user.fullName   =  req.body.fullName;
                    _user.username  =  req.body.username;
                    _user.branchId  = parseInt(req.body.branchId);
                    _user.roleId  =  parseInt(req.body.roleId);
                    _user.statusId  =  parseInt(req.body.statusId);
                    _user.state =  1;
                    if(req.body.new_password.length > 0) {
                        pwOperations.encryptPassword(req.body.new_password, function (output) {
                            _user.password = output;
                            user.update(JSON.parse(JSON.stringify(_user)), {where: {id: _user.id}}).then(function () {
                                res.send({status: 200});
                            });
                        });
                    }else {
                        user.update(JSON.parse(JSON.stringify(_user)), {where: {id: _user.id}}).then(function (returnModel) {
                            res.send({status: 200});
                        });
                    }
                }
            });
        }

    });


});


/**
 * user delete action
 */
router.post(base.router.getPattern('post.user.delete'), function (req, res, next) {
        var userQuery = mysqlDB.getQuery('user');
       // var user =   mysqlDB.getModel('user');
      let  user= parseInt(req.body.id);
      //  user.state = 0;
      //  user.statusId=2;
      console.log('user new',user)
     //   console.log('user new',user)
        userQuery.deleteUser(user,function (output) {
            console.log('user query del',output)
            res.send(200);
        });
});

module.exports = router;