/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transfer_management_info', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    transferId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'transfer_management_summary',
        key: 'id'
      },
      field: 'transfer_id'
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
      type: Sequelize.FLOAT,
      allowNull: false,
      field: 'qty'
    },
    cost: {
      type: "DOUBLE",
      allowNull: false,
      field: 'cost'
    },
    acceptedQty: {
      type: Sequelize.INTEGER(100),
      allowNull: false,
      defaultValue: 0,
      field: 'accepted_qty'
  },
  rejectedQty: {
    type: Sequelize.INTEGER(100),
    allowNull: false,
    defaultValue: 0,
    field: 'rejected_qty'
},
  reacceptedQty: {
   type: Sequelize.INTEGER(100),
   allowNull: false,
   defaultValue: 0,
   field: 'accepted_qty'
},
  rerejectedQty: {
   type: Sequelize.INTEGER(100),
   allowNull: false,
   defaultValue: 0,
   field: 'rerejected_qty'
},
 erroredQty: {
   type: Sequelize.INTEGER(100),
   allowNull: false,
   defaultValue: 0,
   field: 'errored_qty'
  },
 rejectionState: {
  type: Sequelize.INTEGER(100),
  allowNull: false,
  defaultValue: 0,
  field: 'rejection_state'
    }

  }, {
    tableName: 'transfer_management_info'
  });
};
