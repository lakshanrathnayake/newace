'use strict';
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const AccessToken = sequelize.define('access_tokens', {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        token: {
            type: Sequelize.STRING,
            allowNull: true
        },
        expires_at: {
            type: Sequelize.DATE,
            allowNull: true

        },
        state: {
            type: Sequelize.INTEGER,
            allowNull: true

        }
    }, {
        tableName: 'access_tokens',
        underscored: true,
        freezeTableName: true,
        timestamps: false
    });
    //AccessToken.sync();
    return AccessToken;
};