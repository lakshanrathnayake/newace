/* jshint indent: 2 */
const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        fullName: {
            type: Sequelize.STRING(200),
            allowNull: false,
            field: 'full_name'
        },
        username: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
            field: 'username'
        },
        password: {
            type: Sequelize.STRING(120),
            allowNull: false,
            field: 'password'
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
        roleId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'user_role',
                key: 'id'
            },
            field: 'role_id'
        },
        statusId: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'user_status',
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
        tableName: 'user'
    });
};
