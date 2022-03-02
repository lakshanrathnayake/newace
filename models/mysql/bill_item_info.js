/* jshint indent: 2 */
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bill_item_info', {
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
    productId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product',
        key: 'id'
      },
      field: 'product_id'
    },
    qty: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      field: 'qty'
    },
    unitPrice: {
      type: "DOUBLE",
      allowNull: true,
      field: 'unit_price'
    },
    discount: {
      type: "DOUBLE",
      allowNull: true,
      field: 'discount'
    },
    voucherCode: {
      type: Sequelize.STRING(30),
      allowNull: true,
      field: 'voucher_code'
    },
    taxes: {
      type: "DOUBLE",
      allowNull: true,
      field: 'taxes'
    },
    state: {
      type: Sequelize.INTEGER(1),
      allowNull: true,
      defaultValue: 1,
      field: 'state'
    }
  }, {
    tableName: 'bill_item_info'
  });
};
