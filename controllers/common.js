/**
 * Created by tharindu on 2/16/2018.
 */
const express = require('express');
const router = express.Router();
const base = require('./base')();
const mysqlDB = require('../models/mysql');


/**
 * add row according to model and attribute
 */
router.get(base.router.getPattern('get.common.row'), function (req, res, next) {

    mysqlDB.getModel(req.query.model).findAll({
        where: req.query.whereQuery,
        include: [{all:true}],
        raw:true
    }).then(function (arg) {
        res.send(arg);
    });

});


module.exports = router;