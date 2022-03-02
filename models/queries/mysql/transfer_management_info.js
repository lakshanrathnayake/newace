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
function TransferManagementInfo(db) {
    // inheritance management
    this.__proto__ = new Base('transfer_management_info', db);

    /**
     * add transfer info
     * @param model
     * @param i
     * @param callback
     */
    this.addTransferInfo = function (model, callback) {

        model.create(model).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        });
    };
    this.deleteOrderRequest = function (transferId, callback) {
        sequelizeObject
          .query(
             
             "DELETE FROM transfer_management_info WHERE transfer_management_info.transfer_id=" + transferId,
            {
              type: Sequelize.QueryTypes.DELETE,
            }
          )
          .then(function (output) {
            callback(output);
          })
      };

    /**
     * delete deleteTranserRequestInfo
     * @param transferManagementSummary
     * @param transferSummaryId
     * @param callback
     */
    this.deleteTranserRequestInfo=function (transferInfoModel,transferSummaryId,callback){
        transferInfoModel.destroy({
            where: {
                transferId: transferSummaryId
            }
        }).then(function(rowDeleted){
            callback(rowDeleted)
        }, function(err){
            console.log(err);
        });
    }


    /**
     * search by transfer id
     * @param model
     * @param callback
     */
    this.getByTransferId = function (model, callback) {
        model.findAll({
            where: {transferId: model.transferId},
            include: [{all: true}]
        }).then(function (returnModel) {
            callback(true,returnModel);
        }).catch(function (error) {
            callback(false,error);
        });
    };
    this.getByTransferIdOrderRequest = function (branchId,transferId, callback) {
        sequelizeObject
          .query(
             
            "SELECT r.*, date as date_formatted,SUM(info.qty) AS qty, source.branch_name AS source_name,SUM(info.cost) AS linetotal,info.cost, \n" + 
            "destination.branch_name AS destination_name ,p.id AS productId,p.barcode,p.product_name,\n" + 
            "type.name as type_name FROM transfer_management_summary AS r \n" +
            "LEFT JOIN transfer_management_info AS info ON r.id=info.transfer_id LEFT \n" +
            "JOIN branch AS source ON r.source = source.id\n" +
            "LEFT JOIN product AS p ON info.product_id= p.id\n" +
            "LEFT JOIN branch AS destination ON r.destination = destination.id LEFT JOIN transfer_type AS type ON\n" + 
            "r.type_id = type.id WHERE r.source ='"+branchId+"' AND r.id='"+transferId+"'  \n" +
            "GROUP BY r.id ORDER BY date_formatted DESC",
            {
              type: Sequelize.QueryTypes.SELECT,
            }
          )
          .then(function (output) {
            callback(output);
          });
      };

      this.getGrnNo = function (branchId,transferId, callback) {
        sequelizeObject
          .query(
             
            "SELECT transfer_management_summary.grn_no \n" + 
            "FROM transfer_management_summary \n" + 
            "WHERE transfer_management_summary.type_id='"+branchId+"' AND transfer_management_summary.source='"+transferId+"'  \n" + 
            "ORDER BY Id DESC LIMIT 1",
            {
              type: Sequelize.QueryTypes.SELECT,
            }
          )
          .then(function (output) {
            callback(output);
          }).catch(function (error) {
            callback(false,error);
        });
      };


    // returning the object
    return this;
}
module.exports = TransferManagementInfo;