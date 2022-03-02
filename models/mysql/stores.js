/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('stores', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        branchId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'branch',
                key: 'id'
            },
            field: 'branch_id'
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
        reorderLevel: {
            type: Sequelize.FLOAT,
            allowNull: false,
            field: 'reorder_level'
        },
        minOrderQuantity: {
            type: Sequelize.FLOAT,
            allowNull: false,
            field: 'min_order_quantity'
        },
        state: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            field: 'state'
        }
    }, {
        tableName: 'stores'
    });
};
