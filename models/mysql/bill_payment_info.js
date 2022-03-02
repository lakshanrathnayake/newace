/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bill_payment_info', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    billId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'bill_summary',
        key: 'id'
      },
      field: 'bill_id'
    },
    paymentMethodId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'bill_payment_method',
        key: 'id'
      },
      field: 'payment_method_id'
    },
    amount: {
      type: "DOUBLE",
      allowNull: true,
      field: 'amount'
    },
    referenceNo: {
      type: Sequelize.STRING(255),
      allowNull: true,
      field: 'reference_no'
    }
  }, {
    tableName: 'bill_payment_info'
  });
};
