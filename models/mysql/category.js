/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('category', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    categoryName: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      field: 'name'
    },
      state: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          defaultValue: 1,
          field: 'state'
      }
  }, {
    tableName: 'category'
  });
};
