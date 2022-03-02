/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_status', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    code: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
      field: 'code'
    },
    name: {
      type: Sequelize.STRING(30),
      allowNull: false,
      field: 'name'
    }
  }, {
    tableName: 'user_status'
  });
};
