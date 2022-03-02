/**
 * Created by tharindu on 2/14/2018.
 */

const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');
const BranchStatusesQuery = mysqlDB.getQuery('branch_status');
const BranchTypeQuery = mysqlDB.getQuery("branch_type");
const imageConfig = require('../images.config.json');

/**
 * Add branch page
 */
router.get(base.router.getPattern('get.branch.add'), function (req, res, next) {

    BranchStatusesQuery.getBranchesStatuses(function (branchStatus) {
        BranchTypeQuery.getBranchesTypes(function (branchTypes) {
            let currentRoute = 'get.branch.add';
            let branch = JSON.stringify(imageConfig.images.branch.file)
            let profile = JSON.stringify(imageConfig.images.profile.file)
            let logo = JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/branch/add_branch', {
                route: currentRoute,
                user: base.getCurrentUser(req),
                branchstatus: branchStatus,
                branchtypes: branchTypes,
                images: {branch: branch, profile: profile, logo: logo}
            });
        });
    });
});


/**
 * List branch page
 */
router.get(base.router.getPattern('get.branch.list'), function (req, res, next) {

    let currentRoute = 'get.branch.list';
  //  req.query.state = 1;
    base.listFilter('Branch', req, ['branchName', 'state', 'type'], function (list) {
        if (list !== undefined) {
            let profile = JSON.stringify(imageConfig.images.profile.file)
            let logo = JSON.stringify(imageConfig.images.logo.file)
            res.render('backend/branch/branch_list', {
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
 * add branch to database
 */
router.post(base.router.getPattern('post.branch.post'), function (req, res, next) {
    req.body.modelName = 'branch';
    let branch = base.requestToModel(req.body);
    console.log('add branch',req.body)
    branch.id =  null;
    let branchQuery = mysqlDB.getQuery('branch');
    branchQuery.addBranch(branch, function (output) {
        res.send(200);
    });
});


/**
 * render branch edit page
 */
router.get(base.router.getPattern('get.branch.edit'), function (req, res, next) {
    base.listFilter('Branch', req, ['id', 'type', 'status'], function (list) {
        if (list !== undefined) {
            BranchStatusesQuery.getBranchesStatuses(function (branchStatus) {
                BranchTypeQuery.getBranchesTypes(function (branchTypes) {
                    let currentRoute = 'get.branch.edit';
                    let branch = JSON.stringify(imageConfig.images.branch.file)
                    let profile = JSON.stringify(imageConfig.images.profile.file)
                    let logo = JSON.stringify(imageConfig.images.logo.file)
                    res.render('backend/branch/admin_edit_branch', {
                        results: list,
                        route: currentRoute,
                        user: base.getCurrentUser(req),
                        branchstatus: branchStatus,
                        branchtypes: branchTypes,
                        images: {branch: branch, profile: profile, logo: logo}
                    });
                });
            });

        } else {
            res.send(500);

        }
    });


});

/**
 * update branch action
 */
router.post(base.router.getPattern('post.branch.update'), function (req, res, next) {
    let branch = mysqlDB.getModel('branch');
    let branchQuery = mysqlDB.getQuery('branch');

    branch.id = parseInt(req.body.id);
    branch.branchName = req.body.branchName;
    branch.telephone = req.body.telephone;
    branch.address = req.body.address;
    branch.typeId = parseInt(req.body.typeId);
    branch.statusId = parseInt(req.body.statusId);
    branch.state=1;

    branchQuery.updateBranch(branch, function (output) {
        res.send(200);
    });

});

/**
 * branch delete action
 */
router.post(base.router.getPattern('post.branch.delete'), function (req, res, next) {
    let branchQuery = mysqlDB.getQuery('branch');
    branch = mysqlDB.getModel('branch');
    branch.id = parseInt(req.body.id);
    branch.state = 0;
    branch.statusId=4;
    branchQuery.deleteBranch(branch, function (output) {
        res.send(200);
    });

});

module.exports = router;