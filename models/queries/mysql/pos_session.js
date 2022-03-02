
var Base = require('./base');
var mysqlDB = require('../../mysql');
var Sequelize = require('sequelize');
const Op = Sequelize.Op


function Session(db) {
    // inheritance management
    this.__proto__ = new Base('session_summary', db);
    var session_status = mysqlDB.getModel('session_status');
    this.findAll = function(cashier_id,callback){
        var session = mysqlDB.getModel('session_summary');
        console.log(cashier_id + ' **************************');
        session.findAll({
            where: {cashierId:parseInt(cashier_id)},
            include: [
                {
                    model: session_status
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };

    this.findSessionById = function(session_id,callback){
        var session = mysqlDB.getModel('session_summary');
        var user = mysqlDB.getModel('user');
        var user_role  = mysqlDB.getModel('user_role');
        session.findOne({
            where: {id: parseInt(session_id)},
            include: [{
                model: session_status
            },
                {
                    model: user,
                    include: [{
                        model: user_role
                    }
                    ]
                }
            ]
        }).then(function (output) {
            callback(output);
        });
    };

    this.addSession = function (session, callback) {
        var productModel = mysqlDB.getModel('session_summary');
        productModel.create(session).then((Session) => {
            callback(Session,null);
        }).catch(function (err) {
            callback([],err);
        });
    };

    this.findOneSession = function(session_id,cashier_id,callback){

        var sessionModel = mysqlDB.getModel('session_summary');
        sessionModel.findOne({
            where: {id:session_id,cashierId:parseInt(cashier_id)},
            include: [
                {
                    model: session_status
                }
            ]
        }).then(function (output) {
            callback(output);
        })
    };


    this.updateSession = function (attr, callback) {
        this.findOneSession(attr.session_id,attr.cashier_id,function(session){
            if(session && session != null){
                session.update(attr.up).then(function (returnModel) {
                    callback(returnModel);
                });
            }
            else{
                callback(null);
            }
        });

    };

    this.billIncrement = function(session_id){
        var sessionModel = mysqlDB.getModel('session_summary');
        sessionModel.findOne({
            where: {id:parseInt(session_id)}
        }).then(function (output) {
            if(output && output != null){
                output.increment('noOfBills', {by: 1});
            }
        })
    };
    // returning the object
    return this;
}
module.exports = Session;

/**
 * sample code goes here
 *
 */




