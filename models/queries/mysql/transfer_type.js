/**
 * Created by Shashika on 2/13/2018.
 */

const Base = require('./base');
const Sequelize = require('sequelize');
const mysqlDB = require('../../mysql');
const Op = Sequelize.Op;

/**
 * transfer type related queries
 * @param db
 * @constructor
 */
function TransferType(db) {

    this.__proto__ = new Base('transfer_type', db);


    /**
     * get all transfer types
     * @param transferType
     * @param callback
     */
    this.getAllTransferTypes =  function (transferType, callback) {
        transferType.findAll().then(transferTypeResult => {
            callback(transferTypeResult);
        });
    }

    let transferModel = mysqlDB.getModel('transfer_type');
    this.getTransferTypes = function(callback){
        transferModel.findAll().then(function(tansferModelValue){
            callback(tansferModelValue);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };


    return this;
}
module.exports = TransferType;