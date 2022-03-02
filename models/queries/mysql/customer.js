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
function Customer(db) {
    // inheritance management
    this.__proto__ = new Base('customer',db);
    let cusModel = mysqlDB.getModel('customer');

    this.addNewCustomer = function (customer, callback) {
        cusModel.create(customer).then((updated) => { // Notice: There are no arguments here, as of right now you'll have to...
            callback(updated,null);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });
    };

    this.searchCustomer = function(str,callback){
        cusModel.findAll({where: {
            [Op.or]: [{customerName: { [Op.like]: '%'+str+'%' } }, {loyaltyReference: { [Op.like]: '%'+str+'%' }},
                {telephone: { [Op.like]: '%'+str+'%' }}]
        }}).then(function(customers){
            callback(customers,null);
        }).catch(function (err) {
            // handle error;
            console.log(err);
            callback([],err);
        });

    };
    this.updateCustomer= function (customer, callback) {
        customer.update(customer, {where: {id: customer.id}}).then(function (returnModel) {
            callback(returnModel);
        });

    }


    // returning the object
    return this;
}
module.exports = Customer;