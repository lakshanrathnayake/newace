// var Base = require('./base');
// /**
//  * User related queries
//  * @param db
//  * @constructor
//  */
// function UserRole(db) {
//     // inheritance management
//     this.__proto__ = new Base('user_role',db);
//
//
//     // returning the object
//     return this;
// }
// module.exports = UserRole;

/**
 * edited by Hansaja on 27/02/2020.
 */
const Base = require('./base');
const mysqlDB = require('../../mysql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
/**
 * User related queries on user role
 * @param db
 * @constructor
 */
function userRoles(db) {
    let userStatusModel = mysqlDB.getModel('user_role');
    this.getUserRoles = function(callback){
        userStatusModel.findAll().then(function(userRoleModel){
            callback(userRoleModel);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };

    // returning the object containing user role data
    return this;
}
module.exports = userRoles;