/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('branch', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        typeId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'branch_type',
                key: 'id'
            },
            field: 'type_id'
        },
        branchName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            field: 'branch_name'
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: false,
            field: 'address'
        },
        telephone: {
            type: Sequelize.STRING(20),
            allowNull: false,
            field: 'telephone'
        },
        statusId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'branch_status',
                key: 'id'
            },
            field: 'status_id'
        },
        state: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            defaultValue: 1,
            field: 'state'
        }
    }, {
        tableName: 'branch'
    });
};
