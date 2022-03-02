/**
 * Created by tharindu on 2/15/2018.
 */
const Base = require('./base');
const mysqlDB = require('../../mysql');
/**
 * branch_type related queries
 * @param db
 * @constructor
 */
function BranchType(db) {
    // inheritance management
    this.__proto__ = new Base('branch_type', db);

    let branchTypeModel = mysqlDB.getModel('branch_type');
    this.getBranchesTypes = function(callback){
        branchTypeModel.findAll().then(function(branchTypeModel){
            callback(branchTypeModel);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };
    // returning the object
    return this;
}
module.exports = BranchType;