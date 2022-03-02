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
function Category(db) {
    // inheritance management
    this.__proto__ = new Base('category', db);
    let Category = mysqlDB.getModel('category');


    /**
     * add category
     * @param category
     * @param callback
     */
    this.addCategory = function (category, callback) {
        console.log(category.name);
        category.create(category).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        });
    };

    /**
     * update category
     * @param category
     * @param callback
     */
    this.updateCategory= function (category, callback) {
        category.update(category, {where: {id: category.id}}).then(function (returnModel) {
            callback(returnModel);
        });

    }

    /**
     * get all categories
     * @param category
     * @param callback
     */
    this.getAllCategories =  function (category, callback) {
        category.findAll().then(categoryResult => {
            callback(categoryResult);
        })
    }

    this.searchCategoriesByName = function(name,callback) {

        Category
            .findAll({
                where : {
                    categoryName:   name
                }
            })
            .then(function (result) {
                callback(result);
            });
    };


    // returning the object
    return this;
}
module.exports = Category;