/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bill_return_info', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    billItemId: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      references: {
        model: 'bill_item_info',
        key: 'id'
      },
      field: 'bill_item_id'
    },
    qty: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'qty'
    },
    reason: {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'reason'
    },
    newBillId: {
      type: Sequelize.STRING(30),
      allowNull: true,
      unique: false,
      field: 'new_bill_no'
    },

      productId:{
          type: Sequelize.INTEGER(11),
          allowNull:true,
          unique:false,
          field:'product_id',
          references: {
              model: 'product',
              key: 'id'
          },
      }

  }, {
    tableName: 'bill_return_info'
  });
};
