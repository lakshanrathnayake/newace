/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_template', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    type: {
      type: Sequelize.STRING(255),
      allowNull: false,
      field: 'type'
    },
    variation: {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'variation'
    },
    state: {
      type: Sequelize.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      field: 'state'
    }
  }, {
    tableName: 'product_template'
  });
};
