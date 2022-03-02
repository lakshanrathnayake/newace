/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('customer', {
    id: {
      type: Sequelize.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    customerName: {
      type: Sequelize.STRING(200),
      allowNull: false,
      field: 'customer_name'
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: true,
      field: 'email'
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false,
      field: 'address'
    },
    telephone: {
      type: Sequelize.STRING(11),
      allowNull: false,
      field: 'telephone'
    },
    loyaltyReference: {
      type: Sequelize.STRING(200),
      allowNull: true,
      field: 'loyalty_reference'
    }
  }, {
    tableName: 'customer'
  });
};
