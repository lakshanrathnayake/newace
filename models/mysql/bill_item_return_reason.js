/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bill_item_return_reason', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'id'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      field: 'name'
    },
    code: {
      type: Sequelize.STRING(100),
      allowNull: false,
      field: 'code'
    }
  },
   {
    tableName: 'bill_item_return_reason'
  });
};
