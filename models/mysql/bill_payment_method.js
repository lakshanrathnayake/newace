/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bill_payment_method', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    name: {
      type: Sequelize.STRING(30),
      allowNull: false,
      field: 'name'
    },
    code: {
      type: Sequelize.STRING(30),
      allowNull: false,
      field: 'code'
    }
  }, {
    tableName: 'bill_payment_method'
  });
};
