function Base(selfModelName, db) {

    var ground = this;
    /**
     * Get the database model
     * @param modelName
     * @returns {any}
     */
    let modelPathPrefix = '../../mysql/';

    this.getModel = function (modelName) {
        return require(modelPathPrefix + modelName);
    };

    /**
     * get repository objects
     * @param modelName
     * @returns {any}
     */
    this.getRepository = function (modelName) {
        return require('./' + modelName);
    };

    /**
     * authenticate connection
     * @param callback
     */
    this.authenticateConnection = function (callback) {

        let result = {
            status: 200,
            message: ''
        };

        this.db.sequelize.authenticate().then(function () {
            result.status = 200;
            result.message = 'Connection has been established successfully';
        }).catch(function (err) {
            //console.error('Unable to connect to the database:', err);
            result.status = 400;
            result.message = 'Unable to connect to the database ' + err;
        }).then(function () {
            callback(result);
        });
    }

    /**
     * add one record
     * @param model
     * @param callback
     */
    this.addBranch = function (model, callback) {
        model.create(model).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        })
    };

    /**
     * get id by name
     * @param model
     * @param callback
     */
    this.getSingleColumnFilter = function (model, callback) {
        model.findAll({
            where: {[model.column + '']: model.value},
            attributes: [model.attributes + ''],
            raw: true
        })
            .then(function (modelArray) {
                callback(modelArray[0][model.attributes + '']);
            });
    }


    /**
     * get all records
     * @param model
     * @param callback
     */
    this.getAll = function (model, callback) {
        model.findAll({raw: true, include: [{all: true}]}).then(function (modelArray) {
            callback(modelArray);
        })
    };


    /**
     * update one record
     * @param model
     * @param callback
     */
    this.updateOne = function (model, callback) {
        model.update(model, {where: {id: model.id}}
        ).then(function (returnModel) {
            callback(returnModel);
        })
    };

    /**
     *delete one record from database
     * @param model
     * @param callback
     */
    this.deleteOne = function (model, callback) {
        model.destroy(model, {where: {id: model.id}}
        ).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        })
    };


    /**
     * get linking value of meta tables to other tables by the show case value
     * @param model
     * @param callback
     */
    this.getRelationshipValue = function (model, callback) {
        model.findOne({
            where: {[model.showCaseColumn + '']: model.showCaseColumnValue},
            attributes: [model.relationshipColumn + ''],
            raw: true
        }).then(function (output) {
            callback(output);
        })
    };
    /**
     * This search is defined for paginated results
     * @param modelName
     * @param query
     * @param offest
     * @param limit
     * @param callback
     */

    this.simpleSearch = function (modelName, query, offest, limit, callback) {
        let model = ground.db.getModel(modelName);
        let attributes = model.rawAttributes, field, queryModified = {};
        Object.keys(query).forEach(function (key1) {
            Object.keys(attributes).forEach(function (key2) {
                field = attributes[key2];

                if (typeof field.references !== 'undefined' && key2.replace(/Id([^Id]*)$/, '$1') == key1) {
                    queryModified[key1 + 'Id'] = query[key1];

                }
                else if (key2.replace(/Id([^Id]*)$/, '$1') == key1) {
                    queryModified[key1] = query[key1];

                }

            });
        });

        model.findAll({where: queryModified, include: [{all: true}], offset: offest, limit: limit}
        ).then(function (outputModel) {
            let a = [((offest / limit) + 2)];
            let b = [((offest / limit))];
            outputModel.pageNext = a;
            outputModel.pagePrev  =b;
            callback(outputModel);
        });

    };

    Array.prototype.extend = function (other_array) {
        other_array.forEach(function (v) {
            this.push(v)
        }, this);
    }


    // self configuration
    this.model = this.getModel(selfModelName);
    this.db = db;
    // end self configuration


}


module.exports = Base;