/**
 * Created by Shashika on 3/10/2018.
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
function TaxType(db) {
    // inheritance management
    this.__proto__ = new Base('tax_type', db);
    let TaxType = mysqlDB.getModel('tax_type');

    /**
     * add tax_type
     * @param tax_type
     * @param callback
     */
    this.addTaxType = function (tax_type, callback) {
        tax_type.create(tax_type).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        });
    };

    /**
     * update tax_type
     * @param tax_type
     * @param callback
     */
    this.updateTaxType= function (tax_type, callback) {
        tax_type.update(tax_type, {where: {id: tax_type.id}}).then(function (returnModel) {
            callback(returnModel);
        });

    };

    this.searchTaxByName = function(name,callback) {

        TaxType
            .findAll({
                where : {
                    taxName:  name
                }
            })
            .then(function (result) {
                callback(result);
            });
    };


    let taxModel = mysqlDB.getModel('tax_type');

    this.getTaxTypes = function(callback){
        taxModel.findAll().then(function(taxTypeValue){
            callback(taxTypeValue);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };


    // returning the object
    return this;
}
module.exports = TaxType;
