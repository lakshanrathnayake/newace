/**
 * Created by hariharan on 3/15/18.
 */
var randomstring = require("randomstring");
var mysqlDB = require('../models/mysql');

var api_helper = {};
var tokenQuery = mysqlDB.getQuery('access_token');

api_helper.createAccessToken = function(user_id,callback){
    var response = {
        status : 500,
        token : null
    };
    if(user_id && user_id != null && parseInt(user_id) > 0){
        var  date = new Date();
        var token = {
            id : "",
            user_id : parseInt(user_id),
            token :randomstring.generate(30),
            expires_at : new Date(date.setDate(date.getDate() + 1)),
            state : 1
        };

        tokenQuery.generateToken(token, function (results) {
            console.log('****************************************');
            console.log(results);
            if(results && results != null){
                response.status = 200;
                response.token = results.token;
            }
            callback(response);
        });
    }
    else{
        callback(response);
    }
};

api_helper.verifyToken = function(token,user_id,callback){
    var verified = false;
    tokenQuery.verifyToken(token,user_id,function(ress){
        if(ress && ress != null){
          verified = ress.verified;
        }
        callback(verified)
    });
};

module .exports = api_helper;