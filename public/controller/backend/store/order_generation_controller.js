
$(document).ready(function () {


    $('#productId').change(function () {

        let postData = {}
        postData['model'] = 'product';
        postData['whereQuery'] = {id: $("#productId").val()};

        $.ajax({
            type: "GET",
            url: url1,
            data: postData,
            success: function (result) {

                $("#unitPrice").val(result[0].cost);
                $("#qty").attr({
                    "min": 0
                });
            }
        });
    });

    $(":input").keypress(function(event){
        if (event.which == '10' || event.which == '13') {
            event.preventDefault();
        }
    });

    $("#barcode").on('change keyup paste', function (e) {
        $("#qih").val("");
        $("#unitPrice").val("");
        $("#qty").val("");
        updateProductDetails();
    });

    function updateProductDetails() {

        let branchId = $("#source").val();
        let barcodePart = $("#barcode").val();
        let typeId = 4;
        let data = {
            typeId: typeId,
            branchId: branchId,
            barcodePart: barcodePart,
            productNamePart: barcodePart
        }

        $.ajax({
            type: "GET",
            url: url3,
            data: data,
            success: function (result) {
                $('#barcode1').data('productId', result.productInfo.id);
                $("#qih").val(result.qih);
                $("#qty").attr({"max": 100000, "min": 0});
                $("#unitPrice").val(Math.round(result.productInfo.cost));
                $('#barcode1').val(result.productInfo.barcode + ',' + result.productInfo.productName);

/*
                $('#barcode1').data('productId', result.id);
                $("#qih").val(0);
                $("#qty").attr({"max": 100000, "min": 0});
                $("#unitPrice").val(Math.round(result.cost));*/

            }
        });
    }

    $('#table tbody').on('click', 'td .rowDeleteButton', function () {
        $(this).closest('tr').remove();
        let table = document.getElementById("table")
        updateTotal(table);
    });

    $("#add").click(function () {

        let postData = {};

        postData['model'] = 'product';
        postData['whereQuery'] = {id: $("#barcode1").data('productId')};

        $.ajax({
            type: "GET",
            url: url1,
            data: postData,
            success: function (result) {
                console.log(result)
                if (result.length > 0) {
                    let r = $('<button type="button" class="btn btn-danger btn-sm rowDeleteButton" value="new button"><i class="fa fa-trash"></i></button>');
                    let obj = result[0];
                    $("#table").find('tbody')
                        .append($('<tr>')
                            .append($('<td>')
                                .append(obj['id'])
                            )
                            .append($('<td>')
                                .append(obj['barcode'])
                            )
                            .append($('<td>')
                                .append(obj['productName'])
                            )
                            .append($('<td>')
                                .append($("#qty").val())
                            )
                            .append($('<td>')
                                .append($("#unitPrice").val())
                            )
                            .append($('<td>')
                                .append(($("#qty").val() * $("#unitPrice").val()))
                            )
                            .append($('<td>')
                                .append(r))
                        )
                    $('td:nth-child(1),th:nth-child(1)').hide();
                    let table = document.getElementById("table")
                    updateTotal(table);
                }


            }
        });

    });

    function updateTotal(table) {
        let sumValue = 0;
        for (let i = 1; i < table.rows.length; i++) {
            sumValue = sumValue + parseInt(table.rows[i].cells[5].innerHTML);
        }
        document.getElementById("total").innerHTML = '';
        document.getElementById("total").innerHTML = sumValue + '';
    }

    $('#transferType').change(function () {
        //console.log("changed");
        switch ($(this).val()) {
            case 'Store In':
                $('#from').prop('disabled', true);
                $('#to').prop('disabled', false);
                $('#supplier').prop('disabled', false);
                $('#invoice').prop('disabled', false);
                break;
            case 'Store Transfer':
                $('#from').prop('disabled', false);
                $('#to').prop('disabled', false);
                $('#supplier').prop('disabled', true);
                $('#invoice').prop('disabled', true);
                break;
            case 'Damage In':
                $('#from').prop('disabled', false);
                $('#to').prop('disabled', true);
                $('#supplier').prop('disabled', true);
                $('#invoice').prop('disabled', true);
                break;
            default:

        }
    });


    $("#main_form").submit(function (event) {
        event.preventDefault();
        bootbox.confirm("Are you sure that you want to confirm this order request?", function(confirm) {
            if(confirm) {
                let table = document.getElementById("table");
                let tableData = tableToJson(table);

                let formData = $('#main_form').serialize();

                let data = {
                    tableData: tableData,
                    formData: formData
                }

                $.ajax({
                    type: 'POST',
                    url: $("#main_form").attr('action'),
                    data: data,
                    success: function (response) {
                        bootbox.alert("Order request sent successfully", function () {
                            location.reload();
                        })
                    }
                });
            }
        });

        return false;
    });

    function tableToJson(table) {
        let data = [];
        // first row needs to be headers
        let headers = [];
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
        }
        // go through cells
        for (let i = 1; i < table.rows.length; i++) {

            let tableRow = table.rows[i];
            let rowData = {};

            for (let j = 0; j < (tableRow.cells.length) - 1; j++) {
                rowData[headers[j]] = tableRow.cells[j].innerHTML;
            }
            data.push(rowData);
        }
        return data;
    }

});