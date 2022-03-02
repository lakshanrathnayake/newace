/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_tax', {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
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
    taxTypeId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tax_type',
        key: 'id'
      },
      field: 'tax_type_id'
    },
    percentage: {
      type: Sequelize.FLOAT,
      allowNull: false,
      field: 'percentage'
    }
  }, {
    tableName: 'product_tax'
  });
};
