var routes = require('../routes.json');
function RouteManager() {
    /**
     * get the url , given a name of the route
     * @param name
     * @returns {string}
     */
    this.getURL = function (name) {
        console.log('kkkkkkk')
        console.log(name)
        var routeObj = routes[name];
        return (routeObj.prefix != '' && typeof routeObj.prefix != 'undefined' ? routeObj+'/':'')+routeObj.controller+'/'+routeObj.pattern;
    };

    /**
     * get the pattern given the name of the route
     * @param name
     * @returns {exports.defaults.pattern|*|rangeToPattern.pattern|.js.options.pattern|.npm.options.pattern|node.regex.pattern}
     */
    this.getPattern = function(name){
        var routeObj = routes[name];
    //    console.log(name);
    //    console.log(routes[name]);
        return '/'+routeObj.pattern;
    }
}
module.exports = RouteManager;


