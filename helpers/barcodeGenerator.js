/**
 * Created by hariharan on 2/27/18.
 */
var Barc = require('barcode-generator')
    ,barc = new Barc()
    ,fs = require('fs');

/**
 * create barcode from a string content
 * @param content
 * @param imgWidth = 300
 * @param imgHeight = 200
 * @param callback
 */
module.exports.generateBarcode = function(obj,callback){
    try{
        if(obj && obj != null){
            var buf = barc.code128(obj.content, parseInt(obj.imgWidth), parseInt(obj.imgHeight));
            fs.writeFile('./public/barcodes/'+obj.imgName+'.png', buf, function(){
                console.log('created *************************');
                callback(true);
            });
        }
        else{
            callback(false);
        }
    }catch(e){
        callback(false);
    }
};