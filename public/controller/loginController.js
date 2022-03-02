$(document).ready(function(){
    $("#signin").click(function(){

        var username =document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var  data = {username:username , pw:password};
      //console.log(data);
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/getLoginData/verify",
            data : data,
            success: function (result)
            {
                //console.log(result);
                if(result.status){
                    switch(result.privilege){
                        case 'Admin':
                            location.href = "http://localhost:3000/admin";
                            ;break;
                        case 'Manager':location.href = routes.host+routes.manager.home.index;
                            ;break;
                        case 'Cashier' : location.href="http://localhost:3000/poss";
                            ;break;
                    }
                }else{
                    alert("Invalid Login");
                }
                // result.forEach(function(item){
                //     //console.log(item);
                //     if(item.name===username){
                //         if(item.password===password){
                //             switch(item.name){
                //                 case 'admin':
                //                     location.href = "http://localhost:3000/admin";
                //                     ;break;
                //                 case 'manager':location.href = "http://localhost:3000/manager";
                //                     ;break;
                //                 case 'cashier' : location.href="http://localhost:3000/poss";
                //                 ;break;
                //             }
                //         }else{
                //
                //         }
                //
                //
                //     }
                //
                // });
            }
        });
     
    });
});