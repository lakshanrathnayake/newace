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
        updateTable(10000);
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


    /**
     * select all button action
     */
    $("#selectallButton").click(function () {
        $(".checkbox").each(function () {
            $(this).prop("checked", true);
        });
    });


    /**
     * select delete all button action
     */
    $("#deleteallButton").click(function () {
        let temp_arr = []
        $(".checkbox").each(function () {
            if (($(this))[0].checked == true) {
                temp_arr.push($(this).data('id'));
            }
        });
       // alert(JSON.stringify(temp_arr));
        console.log('temparr',temp_arr.length)
        if(temp_arr.length ==0){
            bootbox.alert('Plese select products to delete.')
        }
        else{
            bootbox.confirm('Do you want to delete selected products',function(confirm){
                if(confirm){
                    $.ajax({
                        type: "POST",
                        url: url5,
                        data: {
                            product_ids: temp_arr,
                        },
                        cache: false,
                        success: function (result) {
                            //window.location.reload();
                            bootbox.confirm('Selected products deleted sucess',function(confirm){
                                if(confirm){
                                    updateTable(20);
                                }
                                else{
                                    updateTable(20);
                                }
                            })

                           
                        }
                    });

                }
            }
            

            )
        }
       
    });

    
    /**
     *  delete all zero quantity button action
     */
    $("#deleteallButtonQty").click(function () {
        bootbox.alert("Are you want to delete all zero quantity products", function () {
            $.ajax({
                type: "GET",
                url: url6,
                cache: false,
                data: ["123"],
                success: function (result) {
                    window.location.reload();
                }
            });
                    
        })
        
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


    function updateTable(x) {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th>Inactivate</th><th id='header1'>Barcode</th><th>Name</th><th>Quantity</th><th>Re-Order Level</th><th>Minimum Order Quantity</th><th>Action</th></tr>"; // add resources
        $("#table").append(someRow);


        let branchId = $("#branchId").val();
        let barcodePart = $("#barcode").val();
        let productNamePart = $("#productName").val();
        let pageNumber = 1;
        let perPageResults = x;


        pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());


        let data = {
            branchId: branchId,
            state: 1,
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
                    for (let i = 0; i < result.length; i++) {
                        let checkbox =$('<input class="form-check-input checkbox" type="checkbox" data-id="'+ result[i].id +'" id= ""/>');

                        let button1 = $('<a class=" btn btn-danger fa fa-trash" data-id="' + result[i].id + '" style="margin-left:5px" disabled></a>');
                        let button2 = $('<a class=" btn btn-success fa fa-edit " data-id="' + result[i].id + '" disabled></a>');

                        button1.data('id', result[i].id);
                        button2.data('id', result[i].id);
                        let tr = table.insertRow(-1);

                        tabCell = tr.insertCell(-1);
                        checkbox.appendTo(tabCell);

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
                        button2.appendTo(tabCell);
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
                        let checkbox =$('<input class="form-check-input checkbox" type="checkbox" data-id="'+result[i].id+'" id= ""/>');

                        let button1 = $('<a class="delButton btn btn-danger fa fa-trash" data-id="' + result[i].id + '" style="margin-left:5px"></a>');
                        let button2 = $('<a class="editButton btn btn-success fa fa-edit " data-id="' + result[i].id + '"></a>');
                        let tr = table.insertRow(-1);

                        button1.data('id', result[i].id);
                        button2.data('id', result[i].id);

                        let tabCell = tr.insertCell(-1);
                        checkbox.appendTo(tabCell);

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
                        button2.appendTo(tabCell);
                        button1.appendTo(tabCell);
                    }

                    $("#pageNumber").text(pageNumber);

                }
            });
        }


    }

    function updateTableForDownload() {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th id='header1'>Barcode</th><th>Name</th><th>Quantity</th><th>Re-Order Level</th><th>Minimum Order Quantity</th><th>Action</th></tr>"; // add resources
        $("#table").append(someRow);

        let branchId = $("#branchId").val();
        let barcodePart = $("#barcode").val();
        let productNamePart = $("#productName").val();
        let pageNumber = 1;
        let perPageResults = 20;

        pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());

        let data = {
            branchId: branchId,
            state: 1,
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
                    for (let i = 0; i < result.length; i++) {
                        let checkbox =$('<input class="form-check-input checkbox" type="checkbox" data-id="'+result[i].id+'" id= ""/>');

                        let button1 = $('<a class=" btn btn-danger fa fa-trash" data-id="' + result[i].id + '" style="margin-left:5px" disabled></a>');
                        let button2 = $('<a class=" btn btn-success fa fa-edit " data-id="' + result[i].id + '" disabled></a>');

                        button1.data('id', result[i].id);
                        button2.data('id', result[i].id);

                        let tr = table.insertRow(-1);
                        let tabCell = tr.insertCell(-1);

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

                        button2.appendTo(tabCell);
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
                        let checkbox =$('<input class="form-check-input checkbox" type="checkbox" data-id="'+result[i].id+'" id= ""/>');

                        let button1 = $('<a class="delButton btn btn-danger fa fa-trash" data-id="' + result[i].id + '" style="margin-left:5px"></a>');
                        let button2 = $('<a class="editButton btn btn-success fa fa-edit " data-id="' + result[i].id + '"></a>');

                        button1.data('id', result[i].id);
                        button2.data('id', result[i].id);
                        
                        let tr = table.insertRow(-1);
                        let tabCell = tr.insertCell(-1);
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
                        button2.appendTo(tabCell);
                        button1.appendTo(tabCell);
                    }

                    $("#pageNumber").text(pageNumber);

                }
            });
        }


    }

    function downloadCSV(csv, filename) {
        let csvFile;
        let downloadLink;

        csvFile = new Blob([csv], { type: "text/csv" });

        downloadLink = document.createElement("a");
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);
        console.log("download csv");
        downloadLink.click();
    }

    function exportTableToCSV(filename) {
        let csv = [];
        let rows = document.querySelectorAll("table tr");

        for (let i = 0; i < rows.length; i++) {
            let row = [], cols = rows[i].querySelectorAll("td, th");
            for (let j = 1; j < 6; j++){
                row.push(cols[j].innerText);
            }
            csv.push(row.join(","));
        }
        downloadCSV(csv.join("\n"), filename);
    }



});