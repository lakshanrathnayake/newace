$(document).ready(function () {


    $("#barcode").on('keypress', function (e) {
        if (e.which == 13) {
            $("#productName").val("");
            $("#pageNumber").text("");
            updateTable(20);
        }
    });
    $("#searchbtn").on('click', function (e) {
        $("#productName").val("");
        $("#pageNumber").text("");
        updateTable(20);
    });
    $("#productName").on('keypress', function (e) {
        if (e.which == 13) {
            $("#barcode").val("");
            $("#pageNumber").text("");
            updateTable(20);
        }
    });
    $("#searchbtn1").on('click', function (e) {
        $("#barcode").val("");
        $("#pageNumber").text("");
        updateTable(20);
    });

    $("#downloadExcel").on('click', function (e) {
        updateTable(100000);
        let i = 0;
        setTimeout(function () {
            exportTableToCSV('Store List.csv'); i++;
            if (i != 0) {
                updateTable(20);
            }
        }, 3000);

    });



    $("#nextButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());
        $("#pageNumber").text(pageNumber + 1);
        $("#prevButton").prop('disabled', false);
        updateTable(20);
    });


    


    $("#prevButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());
        if (pageNumber <= 1) {
            $("#prevButton").prop('disabled', true);
        } else {
            $("#pageNumber").text(pageNumber - 1);
            updateTable(20);
        }
    });


    $('#branchId').change(function () {
        $("#barcode").val("");
        $("#pageNumber").text("");
        updateTable(20);

    });


    $(document).on('click', '.activateButton', function(){
        let storeId  = ($(this).data("id"));
        bootbox.confirm('Do you want to activate the products to store.',function(confirm){
            if(confirm){
                $.ajax({
                    type: "POST",
                    url: url2,
                    data: {
                        store_id: storeId,
                    },
                    cache: false,
                    success: function (result) {
                        window.location.reload();
                    
                    }
                });
        

            }
        })
        

    });

    $("#nextButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());
        $("#pageNumber").text(pageNumber + 1);
        $("#prevButton").prop('disabled', false);
        updateTable(20);
    });

    function updateTable(x) {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th id='header1'>Barcode</th><th>Name</th><th>Quantity</th><th>Re-Order Level</th><th>Minimum Order Quantity</th><th>Action</th></tr>"; // add resources
        $("#table").append(someRow);



        let branchId = $("#branchId").val();
        let barcodePart = $("#barcode").val();
        let productNamePart = $("#productName").val();
        let pageNumber = 1;
        let perPageResults = x;


        pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());


        let data = {
            branchId: branchId,
            state: 0,
            pageNumber: pageNumber,
            barcodePart: barcodePart,
            productNamePart: productNamePart,
            limit: perPageResults,
            offset: (pageNumber - 1) * perPageResults
        }

        if (branchId === '0') {
            $.ajax({
                type: "GET",
                url: url3,
                data: data,
                success: function (result) {
                    

                    let table = document.getElementById("table");
                    for (var i = 0; i < result.length; i++) {
                        
                        let button1 = $('<a class="activateButton btn btn-info fa fa-ravelry" data-id="' + result[i].id + '"></a>');
                        button1.data('id', result[i].id);
                        let tr = table.insertRow(-1);


                        tabCell = tr.insertCell(-1);
                        checkbox.appendTo(tabCell);

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].barcode;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].productName;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].qty;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].reorderLevel;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].minOrderQuantity;

                        tabCell = tr.insertCell(-1);
                        button1.appendTo(tabCell);
                    }

                    $("#pageNumber").text(pageNumber);

                }
            });
        } else {
            $.ajax({
                type: "GET",
                url: url1,
                data: data,
                success: function (result) {

                    let table = document.getElementById("table");
                    for (let i = 0; i < result.length; i++) {
                        let button1 = $('<a class="activateButton btn btn-info fa fa-ravelry" data-id="' + result[i].id + '"></a>');
                        button1.data('id', result[i].id);

                        let tr = table.insertRow(-1);

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].product.barcode;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].product.productName;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].qty;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].reorderLevel;

                        tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = result[i].minOrderQuantity;

                        tabCell = tr.insertCell(-1);
                        
                        button1.appendTo(tabCell);
                    }

                    $("#pageNumber").text(pageNumber);

                }
            });
        }


    }

  

});