
const router = require('../helpers/router');
const mysqlDB = require('../models/mysql');

function Base() {

    let PER_PAGE_RESULTS = 1000000;
    let USER_ROLES = {
        1: "ADMIN",
        2: "MANAGER",
        3: "CASHIER",
        4: "SUPER_ADMIN"
    };

    /**
     * get current logged in user
     * @param req
     * @returns {*}
     */
    this.getCurrentUser = function (req) {
        if (req.session.username && req.cookies.pos_user && req.session.role) {
            return {
                id: req.session.user_id,
                username: req.session.username,

                role: USER_ROLES[req.session.role],
                branch: (req.session.branchName) ? req.session.branchName : "",
                branchId: (req.session.branch) ? req.session.branch : ""
            }
        } else {

            return null;
        }


    };

    /**
     * Handle requests helper
     * @param request
     * @param successCallback
     * @param errorCallback
     */
    this.handle = function (request, successCallback, errorCallback) {


        let errors = request.validationErrors();
        if (errors.length !== 0) {
            result.code = 500;

            result.message = errors;
            errorCallback(result);
        } else {

            result.code = 200;
            result.message = "Successful";
            successCallback();
        }
    };

    /**
     * generate a list based on defined filters with pagination
     * @param modelName
     * @param req , express request
     * @param filterOptions , an array of filter options. Use the property names in the model
     * @param callback
     */
    this.listFilter = function (modelName, req, filterOptions, callback) {
        let queryObj = mysqlDB.getQuery(modelName), query = {};

        filterOptions.forEach(function (value) {
            console.log(req.query)
            if (value === 'id') {
                query[value] = parseInt(req.query[value]);
            } else if (req.query[value] !== '' && typeof req.query[value] !== 'undefined') {
                query[value] = req.query[value];
            } else {

            }

        });
        let page = (typeof req.query.page == 'undefined') ? 1 : parseInt(req.query.page);
        queryObj.simpleSearch(modelName, query, (page - 1) * PER_PAGE_RESULTS, PER_PAGE_RESULTS, callback);
    };

    /**
     *build model by request model name
     * @param req
     */
    this.requestToModel = function (req) {

        let model = mysqlDB.getModel(req.modelName);
        for (let key in req) {
            model[key + ''] = req[key + ''];
        }
        return model;
    };

    this.router = new router();

    return this;
}

module.exports = Base;