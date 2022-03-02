/**
 * Created by Hansaja on 21/02/2020.
 */
const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
/**
 * User related queries
 * @param db
 * @constructor
 */
function userStatus(db) {
    let userStatusModel = mysqlDB.getModel('user_status');

    this.getUserStatuses = function(callback){
        userStatusModel.findAll().then(function(userModels){
            callback(userModels);
        }).catch(function (err) {
            // handle error;
            callback([],err);
        });

    };


    // returning the object
    return this;
}
module.exports = userStatus;