/**
 * Created by Shashika on 2/20/2018.
 */
var bcrypt = require('bcryptjs');
const saltRounds = 10;

/**
 * to encrypt password
 * @param password
 * @param callback
 */
module.exports.encryptPassword = function (password, callback) {
    bcrypt.hash(password, bcrypt.genSaltSync(10), function (err, hash) {
        if (err) {
            return callback(err)
        } else {

            return callback(hash);
        }
    });



};


/**
 * to compare password
 * @param password
 * @param hash
 * @param callback
 */
module.exports.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, function (err, res) {
        callback(res);
    });
}
