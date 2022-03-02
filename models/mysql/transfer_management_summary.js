/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('transfer_management_summary', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        grnNo:{
            type: Sequelize.STRING(30),
            allowNull: true,
            field: 'grn_no'
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'date'
        },
        typeId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'transfer_type',
                key: 'id'
            },
            field: 'type_id'
        },
        source: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            references: {
                model: 'branch',
                key: 'id',
                as: 'source_id'
            },
            field: 'source'
        },
        destination: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            references: {
                model: 'branch',
                key: 'id',
                as: 'destination_id'
            },
            field: 'destination'
        },
        supplierId: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            references: {
                model: 'supplier',
                key: 'id'
            },
            field: 'supplier_id'
        },
        transferStatusId: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            references: {
                model: 'transfer_status',
                key: 'id'
            },
            field: 'transfer_status_id'
        },
        invoiceNumber: {
            type: Sequelize.STRING(30),
            allowNull: true,
            field: 'invoice_number'
        }
    }, {
        tableName: 'transfer_management_summary'
    });
};
