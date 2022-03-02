/**
 * Created by hariharan on 2/21/18.
 */
let nodeModuleHelper = {};

/**
 * $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
 * $$$$$$$$$$$$$$$$$$$$$$$$$$$$  LOGS MODULES  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
 * $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
 */
let logs = {};

/**
 * logger module
 * can be log error, info, warn, trace
 * @type {function(*, *): *}
 */
const createNewLog = (type, path) => {
    const opts = {
        logDirectory: './logFiles/' + path,
        fileNamePattern: type + '_<DATE>.log',
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    };
    return require('simple-node-logger').createRollingFileLogger(opts);
};

/**
 * initiate logs
 */

/**
 * system logs
 * @type {{activity: *}}
 */
const billLogs = createNewLog('BILL','bills');
const loginLogs = createNewLog('LOGIN','logins');
const loyaltyLogs = createNewLog('LOYALTY','loyalty');
const dbLogs = createNewLog('DB','db');
const systemLogs = createNewLog('SYSTEM','system');

/**
 * system logs
 * @param status
 * @param data
 */
logs.insertSystemLog = function(status,data){
    systemLogs[status]('System Activity : ['+data.username+'] : ['+data.role+'] : ['+data.branch+'] : ['+ data.message+']')
};

/**
 * user login logs
 * @param status
 * @param type
 * @param data
 */
logs.insertUserLoginLog = function(status,type,data){
    loginLogs[status]('System ['+type+'] : ['+data.username+'] : ['+data.role+'] : ['+data.branch+'] : ['+ data.message+']')
};

/**
 * user bill logs
 * @param status
 * @param data
 */
logs.insertBillLog = function(status,data){
    billLogs[status]('Bill Submission ['+data.type+'] : ['+data.status+'] : ['+data.err+'] : ['+data.branch+'] : ['+data.session+'] : ['+ JSON.stringify(data.bill) +']');
};

/**
 * user loyalty logs
 * @param status
 * @param data
 */
logs.insertLoyaltyLog = function(status,data){
    loyaltyLogs[status]('Loyalty API Requests ['+data.type+'] : ['+data.branch+'] : ['+data.username+'] : ['+data.status+'] : ['+ JSON.stringify(data.req) +'] : ['+ JSON.stringify(data.res) +']');
};


/**
 * database logs
 * @param status
 * @param activity
 * @param message
 */
logs.insertDbActivityLog = function(status,activity,message){
    dbLogs[status]('['+activity+'] : [' + message+']');
};

nodeModuleHelper.logs = logs;

module.exports = nodeModuleHelper;
