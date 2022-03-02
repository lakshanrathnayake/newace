/**
 * Created by tharindu on 2/15/2018.
 */
const Base = require('./base');
const mysqlDB = require('../../mysql');
/**
 * branch status related queries
 * @param db
 * @constructor
 */
function BranchStatus(db) {
    // inheritance management
    this.__proto__ = new Base('branch_status', db);

    let branchStatusModel = mysqlDB.getModel('branch_status');
    this.getBranchesStatuses = function(callback){
        branchStatusModel.findAll().then(function(branchStatusModel){
            callback(branchStatusModel);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };

    // returning the object
    return this;




}
module.exports = BranchStatus;