/**
 * Created by Shashika on 2/13/2018.
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
function Product(db) {
    // inheritance management
    this.__proto__ = new Base('product_template', db);
    let productModel = mysqlDB.getModel('product_template');
    this.findTemplates = function(callback){
        productModel.findAll().then(function(output){
            callback(output);
        });
    };

    this.bulkAdd = function (products, callback) {
        productModel.bulkCreate(products).then((products) => {
            callback(products);
        });
    };

    this.updateTemplate = function (id,temp, callback) {
        productModel.update(temp,{ where : {id:parseInt(id)}}).then((template) => {
            callback(template);
        });
    };

    this.deleteTemplate = function(id,callback){
        productModel.findOne({where:{id:id}}).then(function(template){
            if(template && template != null){
                template.destroy();
                callback(true);
            }
            else{
                callback(false);
            }
        });
    };

    this.searchTemplate = function (temp_id, callback) {
        productModel.findOne({
            where : {id : parseInt(temp_id)}
        }).then((template) => {
            callback(template);
        });
    };

    return this;
}
module.exports = Product;

/**
 * sample code goes here
 *
 */




