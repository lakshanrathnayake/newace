var Base = require('./base');
var mysqlDB = require('../../mysql');
var config = require('../../../config.json');
var Sequelize = require('sequelize');
const sequelizeObject = new Sequelize({
    database: config.mysql.database,
    username: config.mysql.username,
    password: config.mysql.password,
    dialect: 'mysql',
    pool: {
        max: config.mysql.maxPoolSize,
        min: config.mysql.minPoolSize,
        acquire: 30000,
        idle: 1000
    },
    define: {
        timestamps: false
    }
});
const Op = Sequelize.Op

/**
 * User related queries
 * @param db
 * @constructor
 */
function User(db) {
    // inheritance management
    this.__proto__ = new Base('user', db);
    let User = mysqlDB.getModel('user');

    // other logics go here

    /**
     * Add user
     * @param user
     * @param callback
     */
    this.addUser = function (usernew, callback) {

        let pwOperations = require('../../../helpers/password_operations');
        pwOperations.encryptPassword(usernew.password, function (output) {
            usernew.password = output;
            User.create(usernew).then(function (returnModel) {
                callback(returnModel);
            }, function (err) {
                callback(err);
            });
        });


    };

    /**
     * Verify user
     * @param user
     * @param callback
     */
    this.verifyUser = function (user, branch, callback) {
        let pwOperations = require('../../../helpers/password_operations');

        user.findOne({where: {username: user.username, state: 1}, include: [{model: branch}]}).then(function (output) {
            if (output != null) {

                let hash = output.dataValues.password;
                let pw = user.password;
                pwOperations.comparePassword(pw, hash, function (output1) {

                    if (output1 == false) {
                        callback(output1);
                    } else {
                        output.dataValues.password = null;
                        callback(output);
                    }
                })

            } else {
                callback(false);
            }
        })
    };


    /**
     * Find user by given column parameter
     * @param user
     * @param callback
     */
    this.findUserBy = function (user, callback) {
        user.findOne({
            where: {[user.columnName + '']: user.columnValue},
            include: [{all: true}]
        }).then(function (output) {
            callback(output);
        });
    };


    /**
     * delete user query
     * @param user
     * @param callback
     */
     this.deleteUser = function (user, callback) {
        sequelizeObject.query( 
        "UPDATE user SET user.status_id=2 , user.state=0 WHERE user.id=" + user,
        {
            type: Sequelize.QueryTypes.UPDATE
        }).then(function (output) {
            callback(output);
        })
    };
    //  this.deleteUser   =  function (user,callback) {
    //      user.update(user, {where: {id: user.id}}).then(function (returnModel) {
    //          callback(returnModel);
    //          console.log('query',returnModel)

    //      }).catch(function (error) {
    //         callback(error);
    //     });
    //  }

    /**
     * update user
     * @param user
     * @param callback
     */
    this.updateUser = function (user, callback) {
        // var pwOperations = require('../../helpers/password_operations');
        console.log(user.password);

        // if(user.password != null) {
        //     pwOperations.encryptPassword(user.password, function (output) {
        //         user.password = output;
        //         console.log(user.password);
        //         user.update(user, {where: {id: user.id}}).then(function (returnModel) {
        //             callback(returnModel);
        //         });
        //     });
        // }else {
        //     console.log(user.password);
        //
        //     user.update(user, {where: {id: user.id}}).then(function (returnModel) {
        //         callback(returnModel);
        //     });
        // }

        user.update(user, {where: {id: user.id}}).then(function (returnModel) {
            callback(returnModel);
        });

    }

    this.searchUserByUsername = function (username, callback) {

        User.findAll({
            where: {username: username}
        })
            .then(function (result) {
                callback(result);
            }, function (err) {
                callback(err);
            });
    };

    this.findUserById = function (userId, callback) {

        User.findOne({
            where: {id: userId}
        })
            .then(function (result) {
                callback(result);
            });
    };


    // returning the object
    return this;
}

module.exports = User;