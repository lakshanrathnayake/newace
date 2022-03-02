/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('session_summary', {
    cashierId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      },
      field: 'cashier_id'
    },
    startTime: {
      type: Sequelize.DATE,
      allowNull: false,
      field: 'start_time'
    },
    endTime: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'end_time'
    },
    startBalance: {
      type: "DOUBLE",
      allowNull: false,
      field: 'start_balance'
    },
    endBalance: {
      type: "DOUBLE",
      allowNull: true,
      field: 'end_balance'
    },
    noOfBills: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      field: 'no_of_bills',
      defaultValue: 0
    },
    statusId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'session_status',
        key: 'id'
      },
      field: 'status_id'
    },
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    }
  }, {
    tableName: 'session_summary'
  });
};
