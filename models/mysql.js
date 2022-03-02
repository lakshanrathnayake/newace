var config = require('../config.json');
const Sequelize = require('sequelize');
const fs = require('fs');

// main database object, actually this does something similar to doctrine in Symfony. Not exactly !
var logs = require('../controllers/logs');
const customLogging = function(msg) {
    logs.logs.insertDbActivityLog('info','MYSQL',msg.toString());
};

// Singleton
var db = (function(){


    var ground = this;

    const modelPath = 'mysql/';
    const queriesPath = '../models/queries/mysql/';

    // connection initiation for mysql
    const sequelizeObject = new Sequelize({
        database: config.mysql.database,
        username: config.mysql.username,
        password: config.mysql.password,
        dialect: 'mysql',
        pool: {
            max: config.mysql.maxPoolSize,
            min: config.mysql.minPoolSize,
            acquire: 30000,
            idle: 1000
        },
        define: {
            timestamps: false
        },
        logging:customLogging
    });
    this.getsequelizeObject=function(){
        return sequelizeObject;
    }

    var models =  {};
    var queries =  {};

    // loading models
    var moduleName= '',splitOnDot=[];
    fs.readdirSync(__dirname+'/'+modelPath).forEach(function(fileName){
        splitOnDot = fileName.split('.');
        moduleName = splitOnDot[0];
        if(splitOnDot[1] == 'js' && splitOnDot.length < 3)
        {
            models[moduleName] = require('./'+modelPath+moduleName)(sequelizeObject, Sequelize);
        }
    });

    // relations configuration
    Object.keys(models).forEach(function(key1) {
        var sourceObj = models[key1];
        var sourceObjectAttributes = sourceObj.rawAttributes;


        Object.keys(sourceObjectAttributes).forEach(function(key2) {
            var modelField = sourceObjectAttributes[key2];

            if(modelField !== null && typeof modelField !== 'undefined'  && typeof modelField.references !== 'undefined'){
                var targetObj = models[modelField.references.model];
                console.log(key1+" belongs to "+modelField.references.model)
                sourceObj.belongsTo(targetObj,{foreignKey: key2})

            }
        });
    });

    models['bill_summary'].hasMany(models['bill_payment_info'],{sourceKey:'id',foreignKey:'billId'});

    /**
     * Get model object, singleton
     * @param name
     * @returns {*}
     */
    this.getModel = function(name){
        return models[name.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "")];
        // return require('./'+modelPath+name.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, ""))(ground);
    };

    /**
     * Get query object
     * @param name
     * @returns {*}
     */
    this.getQuery = function(name){
        return require('./'+queriesPath+name.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, ""))(ground);
    };

    return this;
})();

module.exports = db;