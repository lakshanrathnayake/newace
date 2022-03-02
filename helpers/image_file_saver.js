/**
 * Created by Shashika on 2/12/2018.
 */

var express = require('express');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var config  =  require('../config.json');

var app = express();
var fileSavingInfo = {
    status: 200,
    dirName: '',
    imageName: ''
}

app.use(bodyParser.json());
app.use(fileUpload({safeFileNames: true}));

/**
 * save file to specific folder
 * @param req
 * @returns {number}
 */
module.exports.saveFile = function (req) {
    if (!req.files)
        return 0;
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var sampleFile = req.files.sampleFile;

    var dirName  =  '';
    if(req.imageType == 'product'){
        dirName = ''+__dirname+config.productImageDir;
    }else if(req.imageType == 'user'){
        dirName = ''+__dirname+config.userImageDir;
    }

    var imageName = randomString(40) + '.jpg';

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(dirName + fileName, function (err) {
        if (err) {
            fileSavingInfo.status = 500;
            return fileSavingInfo;
        } else {
            fileSavingInfo.dirName = dirName;
            fileSavingInfo.imageName =  imageName;
            return fileSavingInfo;
        }

    });
}


/**
 * generate random string
 * @param length
 * @returns {string}
 */
var randomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}