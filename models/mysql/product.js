/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('product', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        barcode: {
            type: Sequelize.STRING(255),
            allowNull: false,
            field: 'barcode'
        },
        partNumber: {
            type: Sequelize.STRING(50),
            allowNull: false,
            field: 'part_number'
        },
        productName: {
            type: Sequelize.STRING(255),
            allowNull: false,
            field: 'product_name'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            field: 'description'
        },
        categoryId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'category',
                key: 'id'
            },
            field: 'category_id'
        },
        manufacturerPrice: {
            type: "DOUBLE",
            allowNull: false,
            field: 'manufacturer_price'
        },
        cost: {
            type: "DOUBLE",
            allowNull: false,
            field: 'cost'
        },
        sellingPrice: {
            type: "DOUBLE",
            allowNull: false,
            field: 'selling_price'
        },
        minOrderQuantity: {
            type: Sequelize.FLOAT,
            allowNull: false,
            field: 'min_order_quantity'
        },
        reorderLevel: {
            type: Sequelize.FLOAT,
            allowNull: false,
            field: 'reorder_level'
        },
        imageUrl: {
            type: Sequelize.TEXT,
            allowNull: true,
            field: 'image_url'
        },
        tax: {
            type: Sequelize.TEXT,
            allowNull: true,
            field: 'tax'
        },
        statusId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'product_status',
                key: 'id'
            },
            field: 'status_id'
        },
        state: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            field: 'state'
        },
        tax: {
            type: Sequelize.TEXT,
            allowNull: true,
            field: 'tax'
        }
    }, {
        tableName: 'product'
    });
};
