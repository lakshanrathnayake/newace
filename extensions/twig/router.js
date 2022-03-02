var routes = require('../../routes.json');
var config = require('../../config.json')


/**
 * get the url for front end
 * @param name
 * @returns {string}
 */
module.exports.getURL = function (name) {
    var routeObj = routes[name];
    return config["host"].host+ config["host"].port+ routeObj.controller + '/' + routeObj.pattern;
};

/**
 * check current active route
 * @param currentPath
 * @param name
 */
module.exports.getDate = function(){
    var date = new Date();
    return date.toDateString();
};

// module.exports =getURL;





