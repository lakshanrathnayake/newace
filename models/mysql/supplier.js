/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('supplier', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        supplierName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            field: 'supplier_name'
        },
        address: {
            type: Sequelize.STRING(400),
            allowNull: false,
            field: 'address'
        },
        telephone: {
            type: Sequelize.STRING(11),
            allowNull: false,
            field: 'telephone'
        },
        email: {
            type: Sequelize.STRING(200),
            allowNull: false,
            field: 'email'
        },
        state: {
            type: Sequelize.INTEGER(4),
            allowNull: false,
            defaultValue: 1,
            field: 'state'
        }
    }, {
        tableName: 'supplier'
    });
};
