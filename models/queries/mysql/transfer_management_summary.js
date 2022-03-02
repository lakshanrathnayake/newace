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


function randomIDGeneratorOnDate() {
    var date = new Date();
    var components = [
        date.getYear() - 100,
        "/" + (date.getMonth() + 1),
        "/" + date.getDate(),
        "/" + date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    ];

    var id = components.join("");
    return id;

}

function TransferManagementSummary(db) {
    // inheritance management
    this.__proto__ = new Base('transfer_management_summary', db);
    var transferManagementInfo = mysqlDB.getModel('transferManagementInfo');
    /**
     * add transfer management summary
     * @param transferManagementSummary
     * @param callback
     */
     this.addTransferSummary = function (transferManagementSummary, callback) {
        if (
          transferManagementSummary.typeId == 1 ||
          transferManagementSummary.typeId == 3
        ) {
          //if store in or damage in
          transferManagementSummary.transferStatusId = 1;
        } else {
          transferManagementSummary.transferStatusId = 2; //else store transfer of order request
        }
        /*
        if (
          transferManagementSummary.typeId === 4 &&
          transferManagementSummary.grnNo === null
        ) {
          transferManagementSummary.grnNo = "OR" + randomIDGeneratorOnDate();
        } */
        transferManagementSummary.date = new Date();
    
        // TODO -  transferManagementSummary.typeId - SI/ST/DM/OR+  "/"  +  transferManagementSummary.source
    
        // search
    
        if (transferManagementSummary.typeId === 1) {
          generateTransferSummaryRefNo(
            transferManagementSummary.typeId,
            transferManagementSummary.source,
            function (grnno) {
              transferManagementSummary.grnNo = grnno;
              transferManagementSummary
                .create(transferManagementSummary)
                .then(function (returnModel) {
                  callback(returnModel.get({ plain: true }));
                });
            }
          );
        } else if (transferManagementSummary.typeId === 2) {
          generateTransferSummaryRefNo(
            transferManagementSummary.typeId,
            transferManagementSummary.source,
            function (grnno) {
              transferManagementSummary.grnNo = grnno;
              transferManagementSummary
                .create(transferManagementSummary)
                .then(function (returnModel) {
                  callback(returnModel.get({ plain: true }));
                 
                });
            }
          );
        } else if (transferManagementSummary.typeId === 3) {
          generateTransferSummaryRefNo(
            transferManagementSummary.typeId,
            transferManagementSummary.source,
            function (grnno) {
              transferManagementSummary.grnNo = grnno;
              transferManagementSummary
                .create(transferManagementSummary)
                .then(function (returnModel) {
                  callback(returnModel.get({ plain: true }));
                });
            }
          );
        } else {
          generateTransferSummaryRefNo(
            transferManagementSummary.typeId,
            transferManagementSummary.source,
            function (grnno) {
              transferManagementSummary.grnNo = grnno;
              transferManagementSummary
                .create(transferManagementSummary)
                .then(function (returnModel) {
                  callback(returnModel.get({ plain: true }));
                });
            }
          );
        }
      };
      function generateTransferSummaryRefNo(type_id, source, callback) {
        console.log("dddddddddddddddddddddddddddddddddd");
        let transferManagementSummary = mysqlDB.getModel(
          "transferManagementSummary"
        );
        transferManagementSummary
          .findOne({
            where: { type_id: type_id, source: source },
            order: [["id", "DESC"]],
            attributes: ["id", "grn_no", "type_id"],
          })
          .then(
            function (results) {
              console.log('grnnumber results ////////////',results);
              if (results) {
                let a = JSON.stringify(results);
                let pass = JSON.parse(a);
                let grnno = pass.grn_no;
                let str = grnno.split("-");
                let str1 = str[2];
                let str2 = parseInt(str1) + 1;
                let str3 = str2.toString();
                let str4 = ("000000" + str3).slice(-6);
    
                if (type_id == 1) {
                let grn_no = "SI-" + source + "-" + str4;
                  callback(grn_no);
                } else if (type_id == 2) {
                  
                let grn_no = "ST-" + source + "-" + str4;
                console.log(grn_no);
                  callback(grn_no);
                } else if (type_id == 3) {
                let  grn_no = "DM-" + source + "-" + str4;
                  callback(grn_no);
                } else {
                let  grn_no = "OR-" + source + "-" + str4;
                  callback(grn_no);
                }
              } else {
                if (type_id == 1) {
                let  grn_no = "SI-" + source + "-000001";
                  console.log(grn_no);
                  callback(grn_no);
                } else if (type_id == 2) {
                let  grn_no = "ST-" + source + "-000001";
                  callback(grn_no);
                  console.log("man");
                } else if (type_id == 3) {
                let  grn_no = "DM-" + source + "-000001";
                  callback(grn_no);
                } else {
                let  grn_no = "OR-" + source + "-000001";
                  callback(grn_no);
                }
              }
            },
            function (err) {
              console.log(err);
            }
          );
      }







    this.updateOrderRequest = function (transferId, callback) {
        sequelizeObject
          .query(
           
      
             
             "UPDATE transfer_management_summary SET transfer_management_summary.transfer_status_id =1 WHERE transfer_management_summary.id =" + transferId,
            {
              type: Sequelize.QueryTypes.UPDATE,
            }
          )
          .then(function (output) {
            callback(output);
          });
      };
      this.updateOrderRequestDelete = function (transferId, callback) {
        sequelizeObject
          .query(
           
      
             
             "UPDATE transfer_management_summary SET transfer_management_summary.transfer_status_id =3 WHERE transfer_management_summary.id =" + transferId,
            {
              type: Sequelize.QueryTypes.UPDATE,
            }
          )
          .then(function (output) {
            callback(output);
          });
      };
    /**
     * UpdateTransferSummary
     * @param transferManagementSummary
     * @param callback
     */
    this.UpdateTransferSummary = function (transferManagementSummary, callback) {


        transferManagementSummary.update(
            {transferStatusId: transferManagementSummary.transferStatusId},
            {where: {id: transferManagementSummary.id}}
        )
            .then(result =>
                callback(result)
            )
            .catch(err =>
                console.log(err)
            )
    }
    /**
     * get all store transfer info from destination/source branch
     * @param transferManagementSummary
     * @param callback
     */
    this.getAllTransferTo = function (transferManagementSummary, callback) {

        var transferType = mysqlDB.getModel('transfer_type');
        var branch = mysqlDB.getModel('branch');

        transferType.showCaseColumn = 'name';
        transferType.relationshipColumn = 'code';
        transferType.showCaseColumnValue = transferManagementSummary.typeShowCaseValue;

        branch.showCaseColumn = 'branchName';
        branch.relationshipColumn = 'id';


        this.__proto__.getRelationshipValue(transferType, function (output) {
            transferManagementSummary.type = output.code;
            branch.showCaseColumnValue = transferManagementSummary.sourceShowCaseValue;
            this.__proto__.getRelationshipValue(branch, function (output) {
                if (output != null) {
                    transferManagementSummary.source = output.id;
                } else {
                    transferManagementSummary.source = null;
                }
                branch.showCaseColumnValue = transferManagementSummary.destinationShowCaseValue;
                this.__proto__.getRelationshipValue(branch, function (output) {

                    if (output != null) {
                        transferManagementSummary.destination = output.id;
                    } else {
                        transferManagementSummary.destination = null;
                    }

                    transferManagementSummary.findAll({
                        where: {
                            type: transferManagementSummary.type,
                            [Op.or]: [{destination: transferManagementSummary.destination}, {source: transferManagementSummary.source}]
                        },
                        attributes: ['id'],
                        raw: true,
                        include: [{
                            model: branch,
                            as: 'source'
                        }
                        ]
                    })
                        .then(function (returnModel) {

                            callback(returnModel);
                        })

                })

            });
        });


    }


    /**
     * get all transfer list
     * @param transferManagementSummary
     * @param callback
     */
    this.getAllTransferList = function (transferManagementSummary, callback) {
        sequelizeObject.query("SELECT r.*, date as date_formatted, source.branch_name AS source_name, destination.branch_name AS destination_name , type.name as type_name FROM transfer_management_summary AS r LEFT JOIN branch AS source ON r.source = source.id LEFT JOIN branch AS destination ON r.destination = destination.id LEFT JOIN transfer_type AS type ON r.type_id = type.id WHERE r.source =" + transferManagementSummary.source + " ORDER BY date_formatted DESC ", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };

    /**
     * get all transfer list
     * @param transferManagementSummary
     * @param callback
     */
    this.getAllTransferListV2 = function (transferManagementSummary, attr, callback) {
        var query = "SELECT r.*, date as date_formatted,SUM(info.qty) AS qty, source.branch_name AS source_name, destination.branch_name AS destination_name , type.name as type_name FROM transfer_management_summary AS r LEFT JOIN transfer_management_info AS info ON r.id=info.transfer_id LEFT JOIN branch AS source ON r.source = source.id LEFT JOIN branch AS destination ON r.destination = destination.id LEFT JOIN transfer_type AS type ON r.type_id = type.id WHERE r.source =" + transferManagementSummary.source + " GROUP BY r.id ORDER BY date_formatted DESC , r.transfer_status_id=2 DESC";
        if (attr.limit) {
         
            query += " LIMIT " + attr.limit;
        }
        if (attr.offset) {
            query += " OFFSET " + attr.offset;
        }
        sequelizeObject.query(query, {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };


    /**
     * get all incompleted order requests
     * @param transferManagementSummary
     * @param callback
     */
    this.getOrderRequests = function (transferManagementSummary, callback) {
        sequelizeObject.query("SELECT r.*,date as date_formatted ,r.destination AS destination_id,r.source AS source_id ,source.branch_name AS source_name, destination.branch_name AS destination_name FROM transfer_management_summary AS r LEFT JOIN branch AS source ON r.source = source.id LEFT JOIN branch AS destination ON r.destination = destination.id WHERE r.type_id = 4 and r.transfer_status_id = 2 and r.destination=" + transferManagementSummary.destination + " ORDER BY date_formatted DESC", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };
    this.delTransferSummary = function (transferManagementSummary, callback) {
        sequelizeObject.query("DELETE FROM transfer_management_summary ORDER BY id desc limit 1", {
            type: Sequelize.QueryTypes.DELETE
        }).then(function (output) {
            callback(output);
        })
    };

    /**
     * get transfer reject count
     * @param transferManagementSummary
     * @param callback
     */
    this.getOrderRequestCount = function (transferManagementSummary, callback) {
        sequelizeObject.query("select count(*) as count from transfer_management_summary as r WHERE r.destination = '" + transferManagementSummary.destination + "' AND r.transfer_status_id = '2' AND r.type_id = '4' ", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };

    /**
     * get all store ins from other branches
     * @param transferManagementSummary
     * @param callback
     */
    this.getStoreIn = function (transferManagementSummary, callback) {
        sequelizeObject.query("SELECT r.*,date as date_formatted , source.branch_name AS source_name, destination.branch_name AS destination_name FROM transfer_management_summary AS r LEFT JOIN branch AS source ON r.source = source.id LEFT JOIN branch AS destination ON r.destination = destination.id WHERE r.type_id = 2 and r.transfer_status_id = 2 and r.destination=" + transferManagementSummary.destination + " ORDER BY date_formatted DESC", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };

    /**
     * get store in count
     * @param transferManagementSummary
     * @param callback
     */
    this.getStoreInCount = function (transferManagementSummary, callback) {
        sequelizeObject.query("select count(*) as count from transfer_management_summary as r WHERE r.destination = '" + transferManagementSummary.destination + "' AND r.transfer_status_id = '2' AND r.type_id = '2' ", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };

    /**
     * get transfer reject count
     * @param transferManagementSummary
     * @param callback
     */
    this.getTransferRejectCount = function (transferManagementSummary, callback) {
        sequelizeObject.query("select count(*) as count from transfer_management_summary as r WHERE r.source = '" + transferManagementSummary.source + "' AND r.transfer_status_id = '3' AND r.type_id = '2' ", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    }

    /**
     * get all store ins from other branches
     * @param transferManagementSummary
     * @param callback
     */
    this.getStoreTransferReject = function (transferManagementSummary, callback) {
        sequelizeObject.query("SELECT r.*,date as date_formatted , source.branch_name AS source_name, destination.branch_name AS destination_name FROM transfer_management_summary AS r LEFT JOIN branch AS source ON r.source = source.id LEFT JOIN branch AS destination ON r.destination = destination.id WHERE r.type_id = 2 and r.transfer_status_id = 3 and r.source=" + transferManagementSummary.source + " ORDER BY date_formatted DESC", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };


    /**
     * get all transfers by product name or barcode
     * @param transferManagementSummary
     * @param callback
     */
    this.getTransferSummariesByProductNameBarcode = function (product, callback) {

        console.log(product)
        console.log("********************************")

        sequelizeObject.query("SELECT transfer_management_summary.*,branch.branch_name,transfer_type.name FROM transfer_management_summary LEFT JOIN transfer_management_info ON transfer_management_summary.id = transfer_management_info.transfer_id LEFT JOIN Product ON Product.id = transfer_management_info.product_id LEFT JOIN branch ON branch.id=transfer_management_summary.source LEFT JOIN transfer_type ON transfer_type.id=transfer_management_summary.type_id WHERE Product.product_name LIKE '" + product + "%' OR Product.barcode LIKE '" + product + "%' GROUP BY transfer_management_summary.id ORDER BY date DESC", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };


    /**
     * accept request
     * @param transferManagementSummary
     * @param callback
     */
    this.responseToOrderRequests = function (transferManagementSummary, callback) {
        transferManagementSummary.update({transferStatusId: transferManagementSummary.transferStatusId}, {
            where: {
                id: transferManagementSummary.id
            }
        }).then(function (output) {
            callback(output);
        }).catch(function (error) {
            callback(error);
        });
    };

    /**
     * filtered with transfer type and branch id
     * @param transferManagementSummary
     * @param callback
     */
    this.getByBranchIdTransferType = function (transferManagementSummary, callback) {
        transferManagementSummary.findAll({
            where: {
                typeId: transferManagementSummary.typeId,
                source: transferManagementSummary.source
            }
        }).then(function (output) {
            callback(output);
        })
    };

    /**
     * filtered with transfer type and branch id
     * @param transferManagementSummary
     * @param callback
     */
    this.getBybranchIdTransferTypeDate = function (transferManagementSummary, callback) {

        let typeId = transferManagementSummary.typeId;
        let source = transferManagementSummary.source;
        let date = transferManagementSummary.date;

        if (source == 0 && typeId == 0 && date === '') {
            console.log('source === 0 && typeId === 0 && date === ')
            transferManagementSummary.findAll({
                include: [{all: true}],
                offset: transferManagementSummary.offset, limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });

        } else if (typeId == 0 && date == '') {
            console.log(' typeId === 0 && date === ')
            transferManagementSummary.findAll({
                where: {source: transferManagementSummary.source}
                ,
                include: [{all: true}],
                offset: transferManagementSummary.offset,
                limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });

        } else if (source == 0 && date == '') {
            console.log('source === 0 && date === ')
            transferManagementSummary.findAll({
                where: {typeId: transferManagementSummary.typeId}
                ,
                include: [{all: true}],
                offset: transferManagementSummary.offset,
                limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });

        } else if (source == 0 && typeId == 0) {
            console.log('source === 0 && typeId === 0 ')
            transferManagementSummary.findAll({
                where: {
                    [Sequelize.Op.or]: [{
                        typeId: transferManagementSummary.typeId,
                        source: transferManagementSummary.source
                    }, Sequelize.where(Sequelize.fn('date', Sequelize.col('date')), '=', transferManagementSummary.date)]
                }
                ,
                include: [{all: true}],
                offset: transferManagementSummary.offset,
                limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });
        } else if (source == 0) {
            console.log('source === 0 ')
            transferManagementSummary.findAll({
                where: {
                    [Sequelize.Op.and]: [{
                        typeId: transferManagementSummary.typeId
                    }, Sequelize.where(Sequelize.fn('date', Sequelize.col('date')), '=', transferManagementSummary.date)]
                }
                ,
                include: [{all: true}],
                offset: transferManagementSummary.offset,
                limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });
        } else if (date == '') {
            console.log('date === ')
            transferManagementSummary.findAll({
                where: {
                    [Sequelize.Op.or]: [{
                        typeId: transferManagementSummary.typeId,
                        source: transferManagementSummary.source
                    }]
                }
                ,
                include: [{all: true}],
                offset: transferManagementSummary.offset,
                limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });
        } else if (typeId == 0) {
            console.log('typeId === 0  ')
            transferManagementSummary.findAll({
                where: {
                    [Sequelize.Op.and]: [{
                        source: transferManagementSummary.source
                    }, Sequelize.where(Sequelize.fn('date', Sequelize.col('date')), '=',
                        transferManagementSummary.date)]
                }
                ,
                include: [{all: true}],
                offset: transferManagementSummary.offset,
                limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });
        } else {
            console.log('else ')
            transferManagementSummary.findAll({
                where: {
                    [Sequelize.Op.and]: [{
                        typeId: transferManagementSummary.typeId,
                        source: transferManagementSummary.source
                    }, Sequelize.where(Sequelize.fn('date', Sequelize.col('date')), '=', transferManagementSummary.date)]
                }
                , include: [{all: true}],
                offset: transferManagementSummary.offset, limit: transferManagementSummary.limit
            })
                .then(function (output) {
                    callback(output);
                });
        }

    };

    this.getTransferItemCount = function (transferManagementInfo, summary_id, callback) {
        transferManagementInfo.sum('qty', {
            where: {'transfer_id': summary_id},

        }).then(function (output) {
            if (output) {
                callback(true, output);
            } else {
                callback(false, 0);
            }

        }).catch(function (error) {
            callback(false, error);
        });
    }

    /**
     * filtered with transfer id
     * @param transferManagementSummary
     * @param callback
     */
    this.getAllByTransferID = function (transferManagementSummary, callback) {
        sequelizeObject.query("SELECT r.*,date as date_formatted, source.branch_name AS source_name, destination.branch_name AS destination_name, STATUS.name as status_name, type.name as type_name , supplier.supplier_name as supplier_name FROM transfer_management_summary AS r LEFT JOIN branch AS source ON r.source = source.id LEFT JOIN branch AS destination ON r.destination = destination.id LEFT JOIN transfer_status AS STATUS ON r.transfer_status_id = STATUS.id LEFT JOIN transfer_type AS type ON r.type_id = type.id LEFT JOIN supplier AS supplier ON r.supplier_id = supplier.id WHERE r.id =" + transferManagementSummary.id + "", {
            type: Sequelize.QueryTypes.SELECT
        }).then(function (output) {
            callback(output);
        })
    };
    this.getTransferSearchList = function (branch, type, date, callback) {
        sequelizeObject.query(
            "SELECT\n" +
            "transfer_management_summary.id,\n" +
            "transfer_management_summary.grn_no,\n" +
            "transfer_management_summary.date,\n" +
            "transfer_type.name,\n" +
            "branch.branch_name,\n" +
            "COALESCE(SUM(transfer_management_info.qty), 0) AS count\n" +
            "FROM\n" +
            "transfer_management_summary\n" +
            "LEFT JOIN\n" +
            "transfer_management_info\n" +
            "ON transfer_management_summary.id = transfer_management_info.transfer_id\n" +
            "LEFT JOIN\n" +
            "transfer_type\n" +
            "ON transfer_management_summary.type_id = transfer_type.id\n" +
            "LEFT JOIN\n" +
            "branch\n" +
            "ON transfer_management_summary.source = branch.id\n" +
            "WHERE transfer_management_summary.source ='" + branch + "' AND transfer_management_summary.type_id='" + type + "' \n" +
            "AND transfer_management_summary.date LIKE '%" + date + "%'\n" +
            "GROUP BY\n" +
            "transfer_management_summary.grn_no\n",

            {
                type: Sequelize.QueryTypes.SELECT
            }).then(function (output) {
            callback(output);
        })
    };

    this.getTransferListAll = function (transferManagementSummary, callback) {
        sequelizeObject.query(
            "SELECT\n" +
            "transfer_management_summary.grn_no,\n" +
            "transfer_management_summary.date,\n" +
            "transfer_type.name,\n" +
            "branch.branch_name,\n" +
            "COALESCE(SUM(transfer_management_info.qty), 0) AS count\n" +
            "FROM\n" +
            "transfer_management_summary\n" +
            "LEFT JOIN\n" +
            "transfer_management_info\n" +
            "ON transfer_management_summary.id = transfer_management_info.transfer_id\n" +
            "LEFT JOIN\n" +
            "transfer_type\n" +
            "ON transfer_management_summary.type_id = transfer_type.id\n" +
            "LEFT JOIN\n" +
            "branch\n" +
            "ON transfer_management_summary.source = branch.id\n" +
            "GROUP BY\n" +
            "transfer_management_summary.grn_no\n",

            {
                type: Sequelize.QueryTypes.SELECT
            }).then(function (output) {
            callback(output);
        })
    };


    // returning the object
    return this;
}

module.exports = TransferManagementSummary;