/**
 * Created by hariharan on 3/15/18.
 */

const express = require('express');
const router = express.Router();
const base = require('./../base')();
const apiHelper = require('../../helpers/api_helper');

/**
 * API authentication page
 */
router.get(base.router.getPattern('get.pos.auth'), function (req, res, next) {
    if (req.session.username && req.cookies.pos_user && req.session.role) {
        let user_id = req.session.user_id;
        apiHelper.createAccessToken(user_id,function(response){
            if(response && response.status === 200){
                req.session.token = response.token;
            }
            res.redirect('/pos/session');
        })
    }
    else{
        res.redirect('/logout');
    }

});

module.exports = router;