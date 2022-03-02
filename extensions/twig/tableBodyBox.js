/**
 * Created by tharindu on 2/14/2018.
 */
var mysqlDb = require('../../models/mysql');
/**
 * generate tables in form based relations
 * @param modelName
 * @param property
 * @returns {string}
 */
function tableBodyBox(modelName ,fields){
    var optionsHTML = '',results;
    var i= 0;


    mysqlDb.getModel(modelName).findAll({include: [{all:true}]}).then(function(arg){
        //console.log(arg);
        results = arg;

        results.forEach(function(result){

            var data = JSON.parse(JSON.stringify(result.dataValues));

            optionsHTML +='<tr>';
            for(var key in data){
                var bool = false;
                var field=   fields.toString().replace('[','');
                field.replace(']','');
                var array = field.split(',');
                for(var i=0 ; i<array.length;i++){
                    if(array[i]===key){
                        bool=true;
                        break;
                    }
                }

                if(bool){
                    optionsHTML+='<td>'+data[key]+'</td>';
                }

            }
            optionsHTML += '</tr>'

        });
    });


    String.prototype.replaceAt=function(index, replacement) {
        return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
    }

    return optionsHTML;
}


module.exports = tableBodyBox;
