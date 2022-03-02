/**
 * Created by tharindu on 1/25/2018.
 */
$(document).ready(function(){


    $("#listproduct").click(function() {
        //alert("");
        location.href ="http://localhost:3000/adminlistproduct";
    });
    $("#listuser").click(function() {
        location.href ="http://localhost:3000/adminlistuser";
    });


    $("#listbranch").click(function() {
        location.href ="http://localhost:3000/listbranch";
    });

    $("#transferproductlist").click(function() {
        location.href ="http://localhost:3000/transferproduct";
    });


    $("#damageproductlist").click(function() {
        location.href ="http://localhost:3000/admindamageproductlist";
    });


    $("#storelist").click(function() {
        location.href ="http://localhost:3000/storelist";
    });

});

