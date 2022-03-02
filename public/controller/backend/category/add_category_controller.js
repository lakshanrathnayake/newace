/**
 * Created by tharindu on 2/1/2018.
 */
$(document).ready(function () {


    // $.ajax({
    //     type: "GET",
    //     url: routes.host+routes.admin.categoryOperation.index,
    //     success: function (result) {
    //
    //         //console.log(result);
    //         fillTable(result);
    //
    //     }
    // });


    $('#add').click(function () {
        $("#container").append(' <div class="box-body row"> <div class="form-group"> <label for="inputEmail3" class="col-sm-3 control-label"></label> <div class="col-sm-7"> <input type="text" class="form-control data" id="name" name="name" placeholder="category" required> </div> <div class="btn-group col-sm-2" id ="buttondiv"> </div> </div> </div>');
    });





    $("form").submit(function(){
        //   alert("Submitted");
        bootbox.confirm("Are you sure that you want to confirm this transform?", function(confirm) {
            if(confirm) {
                let data = $('#data').serialize();
                //console.log(data);

                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (result) {

                        bootbox.alert("Category added successfully", function () {
                            window.location = document.referrer;
                        });
                    }
                });
            }
        });
    });



    
    // $('#save').click(function () {
    //
    //
    //
    //     //console.log($('#container')[0].children);
    //     for(var  i =0 ; i<$('#container')[0].children.length ; i++){
    //        // //console.log($('#container')[0].children[i].childNodes[1].childNodes[3].childNodes[1].value);
    //        var val =$('#container')[0].children[i].childNodes[1].childNodes[3].childNodes[1].value;
    //        var  x =$('#container')[0].children[i].childNodes[1].childNodes[3].childNodes[1];
    //       var data  = {Name:val};
    //         $.ajax({
    //             type: "POST",
    //             url: routes.host+routes.admin.categoryOperation.add,
    //             data:data,
    //             success: function (result)
    //             {
    //                 //console.log(result);
    //                 if(result==="Successfully Added"){
    //                     // //console.log(x.value);
    //                     // x.value = "";
    //
    //                 }else{
    //
    //                 }
    //             },
    //             Failed:function (error) {
    //                 //console.log(error);
    //             }
    //         });
    //
    //
    //
    //     }
    //
    //
    //     location.href =   routes.host+routes.admin.addCategory.index;
    //
    //
    // });
    
});


function fillTable(result){

   for(let i =0 ;i<result.length ; i++) {

        let table = document.getElementById("tbody");
        
        let row = table.insertRow(table.getElementsByTagName("tr").length);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);

        cell1.innerHTML = result[i].Name;
        cell2.innerHTML = result[i+1].Name;
        cell3.innerHTML = result[i+2].Name;
        i= i+2;

    }

}
