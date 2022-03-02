/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('session_status', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      field: 'name'
    },
    code: {
      type: Sequelize.STRING(255),
      allowNull: false,
      field: 'code'
    }
  }, {
    tableName: 'session_status'
  });
};
