/**
 * Created by Shashika on 2/13/2018.
 */
var Base = require('./base');
var mysqlDB = require('../../mysql');
/**
 * User related queries
 * @param db
 * @constructor
 */
function ProductTax(db) {
    // inheritance management
    this.__proto__ = new Base('product_tax', db);

    this.bulkAdd = function(taxs,callback){
        let productModel = mysqlDB.getModel('product_tax');
        productModel.bulkCreate(taxs).then((taxs) => { // Notice: There are no arguments here, as of right now you'll have to...
            callback(taxs);
        });
    };

    /**
     * add  tax to each product
     * @param productTax
     * @param callback
     */
    this.addTax = function (productTax, callback) {
        let taxType = mysqlDB.getModel('tax_type');
        taxType.showCaseColumn = 'name';
        taxType.relationshipColumn = 'id';

        productTax.taxPercentage.forEach(function (value, i) {
            taxType.showCaseColumnValue = productTax.taxType[i];
            this.__proto__.getRelationshipValue(taxType, function (output) {
                productTax.create({productId: productTax.productId, taxTypeId: output.id, percentage: productTax.taxPercentage[i]
                }).then(function (output) {
                    callback(output);
                })
            })
        });

    }

    /**
     * update tax
     * @param productTax
     * @param callback
     */
    this.updateTax   =  function (productTax ,callback) {
        let taxType = mysqlDB.getModel('tax_type');
        let productTaxTemp   =   mysqlDB.getModel('product_tax');
        taxType.showCaseColumn = 'name';
        taxType.relationshipColumn = 'id';

        productTax.taxPercentage.forEach(function (value, i) {
            taxType.showCaseColumnValue = productTax.taxType[i];
            this.__proto__.getRelationshipValue(taxType, function (output) {
                productTax.update({ percentage: productTax.taxPercentage[i]},{where:{productId:productTax.productId , taxTypeId:output.id}}).then(function (output1) {
                   if(output1[0] ==1){
                       productTaxTemp.create({productId: productTax.productId, taxTypeId: output.id, percentage: productTax.taxPercentage[i]}).then(function (output) {
                           callback(output);
                       })
                   }
                })

            })
        });
    }

    // returning the object
    return this;
}
module.exports = ProductTax;