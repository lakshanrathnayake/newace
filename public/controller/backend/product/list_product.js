$(document).ready(function () {

    $("#barcode").on('keyup press', function (e) {
        if(e.which == 13){
            $("#productName").val("");
            $("#new_category_id").val("");
            $("#pageNumber").text("");
            updateTable();
        }
    });
    $("#searchbtn").on('click', function (e) {
        $("#productName").val("");
        $("#new_category_id").val("");
        $("#pageNumber").text("");
        updateTable();
    });
    $("#productName").on('keyup press', function (e) {
        if(e.which == 13){
            $("#barcode").val("");
            $("#new_category_id").val("");
            $("#pageNumber").text("");
            updateTable();
        }
    });
    $("#searchbtn1").on('click', function (e) {
        $("#barcode").val("");
        $("#new_category_id").val("");
        $("#pageNumber").text("");
        updateTable();
    });
    $('#new_category_id').change(function () {

        $("#productName").val("");
        $("#barcode").val("");
        $("#pageNumber").text("");
        updateTable();
    });
    $("#nextButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").html())) ? 1 : parseInt($("#pageNumber").html());
        $("#pageNumber").html(pageNumber + 1);
        $("#prevButton").prop('disabled',false);
        updateTable();
    });
    $("#prevButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : (parseInt($("#pageNumber").text()));
        if (pageNumber === 1) {
            $("#prevButton").prop('disabled',true);
        } else {
            $("#pageNumber").text(pageNumber - 1);
            updateTable();
        }
    });
    /**
     * select all button action
     */
    $("#selectallButton").click(function () {
        
        let arr = []
        $(".checkbox").each(function () {
            $(this).prop("checked", true);
            arr[$(this).data('id')] = true;
        });
    });
    /**
     * select delete all button action
     */
    // Check or Uncheck All checkboxes
    $("#deleteallButton").click(function () {
        let temp_arr = []
        $(".checkbox").each(function () {
            if (($(this))[0].checked == true) {
                temp_arr.push($(this).data('id')); 
            }
        });
        if(temp_arr.length == 0){
            bootbox.alert('Plese select products to delete')
        }
        else{
            bootbox.confirm("Are you sure that you want to delete this product?", function (confirm) {
                if(confirm){
              $.ajax({
                  type: "POST",
                  url: url3,
                  data: {
                      product_ids: temp_arr,
                  },
                  cache: false,
                  success: function (result) {
                      //window.location.reload();
                 
                      $.ajax({
                          type: "POST",
                          url: url4,
                          data: {
                              product_ids: temp_arr,
                          },
                          cache: false,
                          success: function (result) {
                              if(result){
                                  bootbox.confirm("Selected products deleted sucess?", function (confirm) {
                                      if(confirm){
                                  window.location.reload()
                                      }
                                      else{
                                  window.location.reload()
                                      }
                                  })
                              }
                             
                          }
                     
                      });
                  }
              })
          }       
          })
            
        }
      //  alert(JSON.stringify(temp_arr));
     
        
      

    });



    function updateTable() {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th id='header1'>Inactivate</th><th>Barcode</th><th>Name</th><th>Category</th><th>Manufacturing Price</th><th>Selling Price</th><th>Minimum Order Quantity</th><th>Reorder Level</th><th style=\"text-align: center; min-width: 170px;\">Action</th></tr>"; // add resources
        $("#table").append(someRow);

        let branchId = $("#branchId").val();
        let barcodePart = $("#barcode").val();
        let productNamePart = $("#productName").val();
        let categoryNamePart  = $ ("#new_category_id").val();
        let perPageResults = 25;
        let pageNumber = isNaN(parseInt($("#pageNumber").html())) ? 1 : parseInt($("#pageNumber").html());
        let data = {

            branchId: branchId,
            state: 1,
            pageNumber: pageNumber,
            barcodePart: barcodePart,
            productNamePart: productNamePart,
            categoryNamePart :categoryNamePart,
            limit: perPageResults,
            offset: (pageNumber - 1) * perPageResults
        };

        $.ajax({
            type: "GET",
            url: url1,
            data: data,
            success: function (result) {
            console.log(result)
                let table = document.getElementById("table");
                for (let i = 0; i < result.length; i++) {
                    let checkbox =$('<input class="form-check-input checkbox" type="checkbox" data-id="'+result[i].id+'" id= ""/>');
                    let link =$('<td style="cursor: pointer" class="barcode-info" id="'+ result[i].productName +'#'+ result[i].barcode +'"> <a>'+ result[i].barcode+ '</a></td>')
                    
                    let button1 = $('<a class="delButton btn btn-danger fa fa-trash" data-id="' + result[i].id + '" style="margin-left:5px"></a>');
                    let button2 = $('<a class="editButton btn btn-success fa fa-edit " data-id="' + result[i].id + '"></a>');
                    button1.data('id', result[i].id);
                    button2.data('id', result[i].id);                    
                    let tr = table.insertRow(-1);

                    tabCell = tr.insertCell(-1);
                    checkbox.appendTo(tabCell);
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].barcode;

                    tabCell = tr.insertCell(-1);                    
                    tabCell.innerHTML = result[i].productName;

                    tabCell = tr.insertCell(-1);                    
                    tabCell.innerHTML = result[i].category.categoryName;

                    tabCell = tr.insertCell(-1);                    
                    tabCell.innerHTML = result[i].manufacturerPrice;

                    tabCell = tr.insertCell(-1);                    
                    tabCell.innerHTML = result[i].sellingPrice;

                    tabCell = tr.insertCell(-1);                    
                    tabCell.innerHTML = result[i].minOrderQuantity;

                    tabCell = tr.insertCell(-1);                    
                    tabCell.innerHTML = result[i].reorderLevel;

                    tabCell = tr.insertCell(-1);
                    button2.appendTo(tabCell);
                    button1.appendTo(tabCell);                    

                }

                $("#pageNumber").html(pageNumber);

            }
        });
    }
    

});