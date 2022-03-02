/**
 * Created by Shashika on 2/13/2018.
 */
const Base = require('./base');
const mysqlDB = require('../../mysql');

/**
 * User related queries
 * @param db
 * @constructor
 */
function Branch(db) {
    // inheritance management
    this.__proto__ = new Base('branch', db);

    /**
     * add branch
     * @param branch
     * @param callback
     */
    this.addBranch = function (branch, callback) {
        branch.create(branch).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        });
    };

    /**
     * search by branch name
     * @param branch
     * @param callback
     */
    this.searchByName = function (branch, callback) {
        branch.findAll({
            where: {
                deletedAt: {
                    [Op.ne]: null
                }
            }
        });
    }

    /**
     * update branch
     * @param branch
     * @param callback
     */
    this.updateBranch = function (branch, callback) {
        branch.update(branch, {where: {id: branch.id}}).then(function (returnModel) {
            callback(returnModel);
        });

    }

    /**
     * delete branch query
     * @param branch
     * @param callback
     */
    this.deleteBranch = function (branch, callback) {
        let user = mysqlDB.getModel('user');
        branch.update(branch, {where: {id: branch.id}}).then(function (returnModel) {

            user.update({state: 0}, {where: {branchId: branch.id}}).then(function (output) {
                callback(output);
            })
        });
    };

    /**
     * find by Id
     * @param branch_id
     * @param callback
     */
    this.findBranchById = function (branch_id, callback) {
        let branch = mysqlDB.getModel('branch');

        branch.findOne({where: {id: parseInt(branch_id)}}).then(bran => {
            callback(bran);
        })
    };


    /**
     * find by Branch Name
     * @param branch_name
     * @param callback
     */
    this.findBranchByName = function (branch_id, callback) {
        let branch = mysqlDB.getModel('branch');

        branch.findAll({where: {state: 1}}).then(bran => {
            callback(bran);
        })
    };



    /**
     * get all branches
     * @param branch
     * @param callback
     */
    this.getAllBranches = function (branch, callback) {
        branch.findAll({where: {state: 1}}).then(branchResult => {
            callback(branchResult);
        });
    };


    //
    let systemBranchModel = mysqlDB.getModel('branch');
    this.getBranches = function(callback){
        systemBranchModel.findAll().then(function(branchModel){
            callback(branchModel);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };


    // returning the object
    return this;
}
module.exports = Branch;