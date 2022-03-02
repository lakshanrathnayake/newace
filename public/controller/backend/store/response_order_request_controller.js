/**
 * Created by Kalpa on 16/11/2020.
 */


function getTableData() {
    data = [];
    let myTab = document.getElementById('table');

    for (i = 1; i < myTab.rows.length; i++) {
        let objCells = myTab.rows.item(i).cells;
        let barcode = objCells.item(1).innerHTML;
        let name = objCells.item(2).innerHTML;
        let quantity = objCells.item(3).innerHTML;
        let unitprice = objCells.item(4).innerHTML;
        let linetotal = objCells.item(1).innerHTML;



        data.push({
            "barcode": barcode,
            "size": linetotal.slice(-2),
            "price": unitprice,
            "name" : name,
            "quantity" : quantity
        });

    }
    window.console.log(data);
    return data;
}


$(document).ready(function () {
    let table = document.getElementById("table")
    $('#add').prop('disabled', true);
    $('#confirm').prop('disabled', true);
    $('#supplierId').prop('disabled', true);
    $("#supplierId").prop("selectedIndex", 0);
    $("#invoiceNumber").prop('disabled', true);
    $("#invoiceNumber").val("");

    updateTotal(table)
    $("#invoiceNumber").prop('disabled', false);
    $('#supplierId').prop('disabled', false);

    $("#barcode").on('change keyup paste', function (e) {
        $("#qih").val("");
        $("#unitPrice").val("");
        $("#qty").val("");
        updateProductDetails();
    });

    function updateProductDetails() {

        let typeId = parseInt($("#typeId").val());
        let branchId = $("#source").val();
        let barcodePart = $("#barcode").val();

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
              
                if (result != undefined || result !== "" || result !== null) {

                    if (typeId === 1 || typeId === 4) {
                        $('#add').prop('disabled', false);
                        $('#barcode1').data('productId', result.productInfo.id);
                        $("#qih").val(result.qih);
                        $("#qty").attr({"max": 100000, "min": 0});
                        $("#unitPrice").val(Math.round(result.productInfo.sellingPrice));
                        $('#barcode1').val(result.productInfo.barcode);
                        $('#productName1').val(result.productInfo.productName);

                    } else {
                        $('#add').prop('disabled', false);
                        $('#barcode1').data('productId', result.product.id);
                        $("#qih").val(result.qty);
                        $("#qty").attr({"max": parseInt(result.qty), "min": 0});
                        $("#unitPrice").val(Math.round(result.product.sellingPrice));
                        $('#barcode1').val(result.product.barcode);
                        $('#productName1').val(result.product.productName);
                    }
                } else {
                    $('#add').prop('disabled', true);
                    $('#barcode1').data('productId', null);
                    $("#qih").val(0);
                    $("#qty").attr({"max": 0, "min": 0});
                    $("#unitPrice").val(0);
                    $('#barcode1').val('');
                    $('#productName1').val('');
                }

            }

        });
    }



    /**
     * table delete button functionality
     */
    $('#table tbody').on('click', 'td .rowDeleteButton', function () {
        $(this).closest('tr').remove();
        let table = document.getElementById("table")
        updateTotal(table);
    });

    /**
     * add button functionality
     */
    $("#add").click(function () {

        let postData = {};
        let typeId = parseInt($("#typeId").val());
        postData['model'] = 'product';
        postData['whereQuery'] = {id: $("#barcode1").data('productId')};

        $.ajax({
            type: "GET",
            url: url1,
            data: postData,
            success: function (result) {


                if (typeId == 1 || typeId == 4) {

                    if (result.length > 0) {
                        if ($("#qty").val() < 0 || $("#qty").val() === '') {
                            $("#qty").val(0);
                        } else {
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


                            let table = document.getElementById("table");


                            updateTotal(table);
                        }

                    }
                } else {
                    if (result.length > 0) {
                        
                        if ($("#qty").val() < 0) {
                            
                            $("#qty").val(0);
                        } else if ($("#qty").val() === '') {
                            
                            $("#qty").val(0);
                        } else if (parseInt($("#qty").val()) > parseInt($("#qih").val())) {
                            $("#qty").val(0);
                        } else {
                            let r = $('<button type="button" class="btn btn-danger btn-sm rowDeleteButton" value="new button"><i class="fa fa-trash"></i></button>');
                            let obj = result[0];

                            // find and remove row here

                            let table = document.getElementById('table');
                            let tr = table.getElementsByTagName('TR');
                            for (let i = 0; i < tr.length; i++) {
                                let td = tr[i].getElementsByTagName('TD');
                                for (let j = 0; j < td.length; j++) {
                                    if (j == 0 && td[j].innerHTML == result[0]['id']) {
                                        document.getElementById('table').deleteRow(i);
                                    }
                                }
                            }

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


                            let table1 = document.getElementById("table1")
                            updateTotal(table1);
                        }

                    }
                }
                $('#add').prop('disabled', true);
                $("#qih").val("");
                $("#unitPrice").val("");
                $("#qty").val("");
                $("#barcode").val("");
                $("#barcode1").val("");
                $("#productName1").val("");



            }




        });



    });

    $("#reject").click(function () {
        bootbox.confirm("Are you sure that you want to accept this order request?", function(confirm){
            if(confirm) {
                let orderRequestId = $("#transferId").val();

                $.ajax({
                    type: "POST",
                    url: url4,
                    data: orderRequestId,
                    success: function (result) {
                        bootbox.alert("Order request rejected", function () {
                            window.location = document.referrer;
                        })
                    }
                });
            }
        })
    });

    $(":input").keypress(function (event) {
        if (event.which == '10' || event.which == '13') {
            event.preventDefault();
        }
    });

    /**
     * submit functionality
     */
    $("#main_form").submit(function (event) {
        event.preventDefault();
        bootbox.confirm("Are you sure that you want to confirm this transfer?", function (confirm) {
            if (confirm) {
                getTableData();

                let orderRequestId = $("#transferId").val();
                let table = document.getElementById("table");
                let tableData = tableToJson(table);
                let tableDataForCSV = tableToJsonForCSV(table);
                let formData = $('#main_form').serialize();

                let data = {
                    tableData: tableData,
                    formData: formData,
                    orderRequestId:orderRequestId
                }



                $.ajax({
                    type: 'POST',
                    url: $("#main_form").attr('action'),
                    data: data,
                    success: function (response) {
                        bootbox.confirm("Transfer Completed. Do you want to download tempprint.csv file as well", function (confirm) {

                            if (confirm) {

                                let saveAs = saveAs || function (e) {
                                    "use strict";
                                    if ("undefined" == typeof navigator || !/MSIE [1-9]\./.test(navigator.userAgent)) {
                                        let t = e.document, n = function () {
                                                return e.URL || e.webkitURL || e
                                            }, o = t.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                                            r = "download" in o, i = function (e) {
                                                let t = new MouseEvent("click");
                                                e.dispatchEvent(t)
                                            }, a = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent),
                                            c = e.webkitRequestFileSystem,
                                            d = e.requestFileSystem || c || e.mozRequestFileSystem,
                                            u = function (t) {
                                                (e.setImmediate || e.setTimeout)(function () {
                                                    throw t
                                                }, 0)
                                            }, s = "application/octet-stream", f = 0, l = 4e4, v = function (e) {
                                                let t = function () {
                                                    "string" == typeof e ? n().revokeObjectURL(e) : e.remove()
                                                };
                                                setTimeout(t, l)
                                            }, p = function (e, t, n) {
                                                t = [].concat(t);
                                                for (let o = t.length; o--;) {
                                                    let r = e["on" + t[o]];
                                                    if ("function" == typeof r)try {
                                                        r.call(e, n || e)
                                                    } catch (i) {
                                                        u(i)
                                                    }
                                                }
                                            }, w = function (e) {
                                                return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["\uFEFF", e], {type: e.type}) : e
                                            }, y = function (t, u, l) {
                                                l || (t = w(t));
                                                let y, m, S, h = this, R = t.type, O = !1, g = function () {
                                                    p(h, "writestart progress write writeend".split(" "))
                                                }, b = function () {
                                                    if (m && a && "undefined" != typeof FileReader) {
                                                        let o = new FileReader;
                                                        return o.onloadend = function () {
                                                            var e = o.result;
                                                            m.location.href = "data:attachment/file" + e.slice(e.search(/[,;]/)), h.readyState = h.DONE, g()
                                                        }, o.readAsDataURL(t), void(h.readyState = h.INIT)
                                                    }
                                                    if ((O || !y) && (y = n().createObjectURL(t)), m) m.location.href = y; else {
                                                        let r = e.open(y, "_blank");
                                                        void 0 === r && a && (e.location.href = y)
                                                    }
                                                    h.readyState = h.DONE, g(), v(y)
                                                }, E = function (e) {
                                                    return function () {
                                                        return h.readyState !== h.DONE ? e.apply(this, arguments) : void 0
                                                    }
                                                }, N = {create: !0, exclusive: !1};
                                                return h.readyState = h.INIT, u || (u = "download"), r ? (y = n().createObjectURL(t), void setTimeout(function () {
                                                    o.href = y, o.download = u, i(o), g(), v(y), h.readyState = h.DONE
                                                })) : (e.chrome && R && R !== s && (S = t.slice || t.webkitSlice, t = S.call(t, 0, t.size, s), O = !0), c && "download" !== u && (u += ".download"), (R === s || c) && (m = e), d ? (f += t.size, void d(e.TEMPORARY, f, E(function (e) {
                                                    e.root.getDirectory("saved", N, E(function (e) {
                                                        let n = function () {
                                                            e.getFile(u, N, E(function (e) {
                                                                e.createWriter(E(function (n) {
                                                                    n.onwriteend = function (t) {
                                                                        m.location.href = e.toURL(), h.readyState = h.DONE, p(h, "writeend", t), v(e)
                                                                    }, n.onerror = function () {
                                                                        let e = n.error;
                                                                        e.code !== e.ABORT_ERR && b()
                                                                    }, "writestart progress write abort".split(" ").forEach(function (e) {
                                                                        n["on" + e] = h["on" + e]
                                                                    }), n.write(t), h.abort = function () {
                                                                        n.abort(), h.readyState = h.DONE
                                                                    }, h.readyState = h.WRITING
                                                                }), b)
                                                            }), b)
                                                        };
                                                        e.getFile(u, {create: !1}, E(function (e) {
                                                            e.remove(), n()
                                                        }), E(function (e) {
                                                            e.code === e.NOT_FOUND_ERR ? n() : b()
                                                        }))
                                                    }), b)
                                                }), b)) : void b())
                                            }, m = y.prototype, S = function (e, t, n) {
                                                return new y(e, t, n)
                                            };
                                        return "undefined" != typeof navigator && navigator.msSaveOrOpenBlob ? function (e, t, n) {
                                            return n || (e = w(e)), navigator.msSaveOrOpenBlob(e, t || "download")
                                        } : (m.abort = function () {
                                            let e = this;
                                            e.readyState = e.DONE, p(e, "abort")
                                        }, m.readyState = m.INIT = 0, m.WRITING = 1, m.DONE = 2, m.error = m.onwritestart = m.onprogress = m.onwrite = m.onabort = m.onerror = m.onwriteend = null, S)
                                    }
                                }("undefined" != typeof self && self || "undefined" != typeof window && window || this.content);
                                "undefined" != typeof module && module.exports ? module.exports.saveAs = saveAs : "undefined" != typeof define && null !== define && null !== define.amd && define([], function () {
                                    return saveAs
                                });

                                const items = tableDataForCSV
                                const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
                                const header = Object.keys(items[0])
                                let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                                csv.unshift(header.join(','))
                                csv = csv.join('\r\n')
                                var file = new Blob([csv], {type: "text/plain;charset=utf-8"});
                                saveAs(file, "tempprint.csv");
                                //window.console.log(items);


                                let arrD = [{
                                    "size": "XXL",
                                    "price": "541",
                                    "barcode": "1234567",
                                    "name": "test item 1"
                                }];

                                console.log(arrD);
                                console.log(getTableData());

                                $.ajax({
                                    dataType: 'json',
                                    type: 'POST',
                                    url: 'http://localhost:9005',
                                    data: JSON.stringify({data:getTableData()}),
                                    success: function (response) {
                                        window.alert('print successfully');
                                    }
                                });
                                $('#confirm').prop('disabled', true);
                                window.location.href="/store/order_requests";

                            } else {
                                $('#confirm').prop('disabled', true);
                                window.location.href="/store/order_requests";
                            }

                        });

                    }
                });
            }
        });

    });

    function ConvertToCSV(objArray) {
        let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        let str = 'ID';

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    function tableToJson(table) {
        let data = [];
        // first row needs to be headers
        let headers = [];
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
        }
        // go through cells
        for (let j = 1; j < table.rows.length; j++) {

            let tableRow = table.rows[j];
            let rowData = {};

            for (let k = 0; k < (tableRow.cells.length - 1); k++) {
                rowData[headers[k]] = tableRow.cells[k].innerHTML;
            }
            data.push(rowData);
        }
        return data;
    }

    function tableToJsonForCSV(table) {
        let data = [];
        // first row needs to be headers
        let headers = [];
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            headers[i] = table.rows[0].cells[i].innerHTML.toUpperCase().replace(/ /gi, '');
        }
        // go through cells
        for (let j = 1; j < table.rows.length; j++) {

            let tableRow = table.rows[j];
            let rowData = {};

            for (let k = 0; k < (tableRow.cells.length - 1); k++) {

                if (headers[k] == 'NAME') {
                    rowData['Name'] = tableRow.cells[k].innerHTML;
                    //rowData['SizePrint'] = tableRow.cells[k].innerHTML.match(/\S+/g)[1].split('-')[0];
                } else if (headers[k] == 'PRODUCTID' || headers[k] == 'LINETOTAL') {

                } else if (headers[k] == 'BARCODE') {
                    rowData['Part'] = tableRow.cells[k].innerHTML;
                    rowData['SizePrint'] = tableRow.cells[k].innerHTML.substr(tableRow.cells[k].innerHTML.length - 2);
                } else if (headers[k] == 'QUANTITY') {
                    rowData['Quantity'] = tableRow.cells[k].innerHTML;
                } else if (headers[k] == 'UNITPRICE') {
                    rowData['Price'] = tableRow.cells[k].innerHTML;
                }

            }
            data.push(rowData);
        }
        return data;
    }


    function updateTotal(table) {
        let sumValue = 0;
        let sumValueUnits = 0;
        for (let i = 1; i < table.rows.length; i++) {
            sumValue = sumValue + parseInt(table.rows[i].cells[5].innerHTML);
        }
        for (let i = 1; i < table.rows.length; i++) {
            sumValueUnits = sumValueUnits + parseInt(table.rows[i].cells[3].innerHTML);
        }
        document.getElementById("total").innerHTML = '';
        document.getElementById("total").innerHTML = sumValue + '';

        document.getElementById("total_units").innerHTML = '';
        document.getElementById("total_units").innerHTML = sumValueUnits + '';


        if (sumValue > 0) {
            $('#confirm').prop('disabled', false);
        } else {
            $('#confirm').prop('disabled', true);
        }
    }

});