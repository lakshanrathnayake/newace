/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bill_summary', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    billNo: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
      field: 'bill_no'
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      field: 'date'
    },
    expiry: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'expiry'
    },
    cashier_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    customer_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      references: {
        model: 'customer',
        key: 'id'
      }
    },
    sessionId: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      field: 'session_id'
    },
    branch_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'branch',
        key: 'id'
      }
    },
    discount: {
      type: "DOUBLE",
      allowNull: true,
      field: 'discount'
    },
    discount_type: {
      type: Sequelize.STRING(30),
      allowNull: true,
      field: 'discount_type'
    },
    taxes: {
      type: "DOUBLE",
      allowNull: true,
      field: 'taxes'
    },
    billStatusId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'bill_status',
        key: 'id'
      },
      field: 'bill_status_id'
    }
  }, {
    tableName: 'bill_summary'
  });
};
