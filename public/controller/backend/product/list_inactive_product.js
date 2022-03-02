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

    $(document).on('click', '.activateButton', function(){
        let storeId  = ($(this).data("id"));
        let url5 = url2 + '?id='+storeId
        bootbox.confirm("Are you want to activate this product?", function (confirm) {
            if(confirm){
        //let storeId  = ($(this).data("id"));
        //let url5 = url2 + '?id='+storeId
        window.location.href=url5;
         
        $.ajax({
            type: "POST",
            url: url4,
            data: storeId,
            cache: false,
            success: function (result) {
                window.location.reload();
            }
        });
    } 
});
    });


    function updateTable() {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th id='header1'>Barcode</th><th>Name</th><th>Category</th><th>Manufacturing Price</th><th>Selling Price</th><th>Minimum Order Quantity</th><th>Reorder Level</th><th >Action</th></tr>"; // add resources
        $("#table").append(someRow);
        let branchId = $("#branchId").val();
        let barcodePart = $("#barcode").val();
        let productNamePart = $("#productName").val();
        let categoryNamePart  = $ ("#new_category_id").val();
        let perPageResults = 25;
        let pageNumber = isNaN(parseInt($("#pageNumber").html())) ? 1 : parseInt($("#pageNumber").html());
        let data = {

            branchId: branchId,
            state: 0,
            pageNumber: pageNumber,
            barcodePart: barcodePart,
            productNamePart: productNamePart,
            categoryNamePart :categoryNamePart,
            limit: perPageResults,
            offset: (pageNumber - 1) * perPageResults
        };

        $.ajax({
            type: "GET",
            url: url3,
            data: data,
            success: function (result) {

                let table = document.getElementById("table");
                for (let i = 0; i < result.length; i++) {
                    
                    let button1 = $('<a class="activateButton btn btn-info fa fa-ravelry" data-id="' + result[i].id + '"></a>');
                    button1.data('id', result[i].id);

                    let tr = table.insertRow(-1);

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
                    button1.appendTo(tabCell);
                    
                                 
                }
                $("#pageNumber").html(pageNumber);

            }
            
        });
    }
   
    

});