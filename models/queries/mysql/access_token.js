const Base = require('./base');
const mysqlDB = require('../../mysql');
/**
 * User related queries
 * @param db
 * @constructor
 */
function User(db) {
    // inheritance management
    this.__proto__ = new Base('access_token', db);

    let tokenModel = mysqlDB.getModel('access_token');

    /**
     * generate token
     * @param token
     * @param callback
     */
    this.generateToken = function (token, callback) {
        tokenModel.findOne({
            where: {user_id:token.user_id}
        }).then(function (output) {
            if(output && output != null){
                this.updateToken(output,token,function(returnModel){

                    callback(returnModel);
                })
            }
            else{
                tokenModel.create(token).then(function (returnModel) {

                    callback(returnModel);
                })
            }
        });

    };


    /**
     * verify token
     * @param req
     * @param callback
     */
    this.verifyToken = function (access_token,user_id, callback) {
        let response = {
            status : 500,
            verified : false
        };
        if(access_token && access_token != null){
            this.findToken(access_token,user_id,function(token){
                if(token && token != null){
                    let expires = token.expires_at;
                    let date = new Date();
                    if(date <= expires){
                        response.status = 200;
                        response.verified = true;
                    }
                    else{
                        response.status = 304;
                    }
                }
                callback(response);
            });
        }
        else{
            callback(response);
        }

    };


    /**
     * find token
     * @param token
     * @param callback
     */
    this.findToken = function (token,user_id, callback) {
        tokenModel.findOne({
            where: {token:token,user_id:parseInt(user_id)}
        }).then(function (output) {
            callback(output);
        });
    };

    /**
     * update token
     * @param user_id
     * @param queries
     * @param callback
     */
    this.updateToken = function (token,queries, callback) {
        delete  queries.user_id;
        delete  queries.id;
        token.update(queries).then(function (updated) {
            callback(updated);
        });
    };

    return this;
}
module.exports = User;