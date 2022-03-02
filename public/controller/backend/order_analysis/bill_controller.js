$(document).ready(function () {


    let bill_items ={};
    let payment_detail = null;
    let loyalty_info = null;

    $(document).on('click', '.remove_bill', function () {
        let bill_id = $(this).val();
        if (typeof parseInt(bill_id) == 'number') {
            bootbox.confirm({
                size: "small",
                message: 'Confirm Delete ?',
                callback: function (confirm) {
                    if (confirm) {
                        $.ajax({
                            type: 'POST',
                            url: sessionUrl + '/delete_bill',
                            data: {
                                bill_id: bill_id
                            },
                            success: function (data) {
                                if (data.status == 200) {
                                    $('.view_transactions').click();
                                    bootbox.alert({
                                        size: "small",
                                        title: "Deleted !!",
                                        message: "'Bill Info Deleted Successfully !!'"
                                    });
                                }
                            },
                            failed: function () {
                                bootbox.alert('server connection failed !!');
                            }
                        });
                    }
                }
            })
        }
    });

    $(document).on('click', '.view_bill', function () {
        let bill_id = $(this).val().split('|')[0];
        let bill_No = $(this).val().split('|')[1];
        if (typeof parseInt(bill_id) == 'number') {
            $.ajax({
                type: 'POST',
                url: sessionUrl + '/get_bill',
                data: {
                    bill_id: bill_id
                },
                success: function (data) {
                    console.log(data);
                    if (data.status == 200) {
                        loadBillView(data, bill_No);
                    }
                },
                failed: function () {
                    bootbox.alert('server connection failed !!');
                }
            });
        }
    });

    /**
     * customer assigning
     */
    $(document).on('click', '.assign_customer', function () {

        loyalty_info = $('#customer_loyalty_reference').val();

        let bill_info = {
            bill: JSON.stringify(bill_items),
            loyaltyReference: loyalty_info,
            paid_total: payment_detail,
        };

        $.ajax({
            type: 'POST',
            url: customerBillAddUrl,
            data:bill_info,
            success: function (data) {

                if (data.status == 200) {
                    bootbox.alert('Customer is added to the bill successfully!');
                } else {
                    bootbox.alert('Customer assignment failed');
                }
            },
            failed: function () {
                bootbox.alert('Customer assignment failed');
            }
        });

    });

    $('#search_customer').on('input', function (e) {

        let input = $(this);
        let customer_search_string = input.val();

        $.ajax({
            type: 'GET',
            url: customerSearchUrl,
            data: {
                customer_search_string: customer_search_string
            },
            success: function (data) {
                if (data.status == 200) {

                    document.getElementById("customer_id").value = data.data.id;
                    document.getElementById("customer_name").value = data.data.customer_name;
                    document.getElementById("customer_mobile").value = data.data.mobile_no;
                    document.getElementById("customer_address").value = data.data.address;
                    document.getElementById("customer_loyalty_reference").value = data.data.loyalty_reference;

                } else {
                    document.getElementById("customer_id").value = "";
                    document.getElementById("customer_name").value = "";
                    document.getElementById("customer_mobile").value = "";
                    document.getElementById("customer_address").value = "";
                    document.getElementById("customer_loyalty_reference").value = "";
                }
            },
            failed: function () {
                bootbox.alert('server connection failed !!');
            }
        });


    });

    function loadBillView(response, bill_No) {
        $('.ret_dis').hide();
        let detailTable = $('#item_table').DataTable();
        let detailTable2 = $('#return_table').DataTable();
        detailTable.clear().draw();
        detailTable2.clear().draw();
        $('#bill-id').text(bill_No);
        let total = 0;
        let payments_html = '';
        $('.payment_html').html(' ');




        let return_total = 0;
        for (let i = 0; i < response.return_items.length; i++) {
            let item = response.return_items[i];

            let tot = 0;
            if (item.bill_item_info == null || item.bill_item_info == 'null') {
                tot = item.qty * item.product.sellingPrice;
                detailTable2.row.add([item.product.productName, item.qty, item.product.sellingPrice, 0, 0,
                    tot]).draw(false);
            } else {
                tot = item.qty * item.bill_item_info.unitPrice;
                tot = tot - (tot * item.bill_item_info.discount / 100) + (tot * item.bill_item_info.taxes / 100);
                detailTable2.row.add([item.bill_item_info.product.productName, item.qty, item.bill_item_info.unitPrice, item.bill_item_info.discount, item.bill_item_info.taxes,
                    tot]).draw(false);
            }


            return_total += tot;
        }

        for (let i = 0; i < response.payments.length; i++) {
            let payment = response.payments[i];
            total += payment.amount;
            payment_detail = total;
            payments_html += '<label for="inputPassword3" class="col-sm-1 control-label">' + payment.bill_payment_method.name + '</label>' +
                '<div class="col-sm-2">' +
                '<input readonly type="text" class="form-control" value="' + payment.amount + '" id="bill_customer">' +
                '</div>';
        }


        let pay_total = 0;
        bill_items =  response.items;
        for (let i = 0; i < response.items.length; i++) {

            let item = response.items[i];

            let tot = (item.unitPrice * item.qty) + ((item.unitPrice * item.qty) * item.taxes / 100) - ((item.unitPrice * item.qty) * item.discount / 100);
            detailTable.row.add([item.product.productName, item.qty, item.unitPrice, item.discount, item.taxes,
                tot]).draw(false);
            pay_total += tot;
        }


        let payments_html_head = '<div class="form-group col-sm-12">' +
            '<label for="inputPassword3" class="col-sm-1 control-label">Bill Total</label>' +
            '<div class="col-sm-2">' +
            '<input readonly type="text" value="' + pay_total + '" class="form-control" id="bill_no">' +
            '</div>' +
            '<label for="inputPassword3" class="col-sm-1 control-label">Discount</label>' +
            '<div class="col-sm-2">' +
            '<input readonly type="text" value="' + response.discount + '" class="form-control" id="discount">' +
            '</div>';

        if (return_total > 0) {
            $('.ret_dis').show();
            payments_html_head += '<label for="inputPassword3" class="col-sm-1 control-label">Return Bill Total</label>' +
                '<div class="col-sm-2">' +
                '<input readonly type="text" value="' + return_total + '" class="form-control" id="bill_no">' +
                '</div>' +
                '</div>';
        }
        $('.payment_html').html(payments_html_head + payments_html);


        $('#billModal').modal('show');
    }


    $('.session_view').click(function () {
        //var branch_id = $('#sess_branch').val();
        let ses_id = $('#sess_id').val();
        if (typeof parseInt(ses_id) == 'number') {
            $('.ses_table').hide();
            $('.restart').hide();
            $('.finish').hide();
            $.ajax({
                type: 'POST',
                url: sessionUrl + '/session',
                data: {
                    //branch_id : parseInt(branch_id),
                    ses_id: parseInt(ses_id)
                },
                success: function (data) {
                    if (data.status == 200) {
                        console.log(data.session);
                        let session = data.session;
                        loadSessionTable(session);
                    }
                    else {
                        bootbox.alert('server connection failed !!');
                    }
                },
                failed: function () {
                    bootbox.alert('server connection failed !!');
                }
            });
        }
        else {
            bootbox.alert('Invalid inputs !!');
        }
    });

    function loadSessionTable(session) {
        $('.restart').hide();
        $('.finish').hide();
        $('#se_id').text(session.id);
        $('#se_st').text((new Date(session.startTime)).toLocaleDateString() + ' ' + (new Date(session.startTime)).toLocaleTimeString());
        $('#se_en').text((new Date(session.endTime)).toLocaleDateString() + ' ' + (new Date(session.endTime)).toLocaleTimeString());
        $('#se_sb').text(session.startBalance);
        $('#se_eb').text(session.endBalance);
        $('#se_sta').text(session.session_status.code);
        if (session.statusId == 1) {
            $('.finish').show();
        }
        else if (session.statusId == 2) {
            $('.restart').show();
        }
        $('.ses_table').show();
    }

    $(document).on('click', '.status', function () {
        let ses_id = $('#sess_id').val();
        let status = $(this).val();
        if (typeof parseInt(ses_id) == 'number') {
            $('.ses_table').hide();
            $.ajax({
                type: 'POST',
                url: sessionUrl + '/change_session',
                data: {
                    status: parseInt(status),
                    ses_id: parseInt(ses_id)
                },
                success: function (data) {
                    if (data.status == 200) {
                        let session = data.updated;
                        $('.session_view').click();
                    }
                    else {
                        bootbox.alert('server connection failed !!');
                    }
                },
                failed: function () {
                    bootbox.alert('server connection failed !!');
                }
            });
        }
        else {
            bootbox.alert('server connection failed !!');
        }
    });

    $('.view_transactions').click(function () {
        let from = $('#from').val();
        let branch = $('#branch').val();
        if (typeof parseInt(branch) == 'number') {
            $.ajax({
                type: 'POST',
                url: sessionUrl + '/load_bills',
                data: {
                    branch_id: parseInt(branch),
                    from: from
                },
                success: function (data) {
                    loadBillTable(data);
                },
                failed: function () {
                    bootbox.alert('server connection failed !!');
                }
            });
        }
        else {
            bootbox.alert('Invalid inputs !!');
        }
    });


    function loadBillTable(data) {
        //$('.bill_table').hide();
        let detailTable = $('#bill_table').DataTable();
        detailTable.clear().draw();
        if (data && data != null) {
            for (let i = 0; i < data.length; i++) {
                let bill = data[i];
                let status = bill.bill_status.code;
                let action = '<div class="btn-group btn-group-sm" role="group" aria-label="">' +
                    '<button value="' + bill.id + '|' + bill.billNo + '" type="button" class="btn btn-default glyphicon glyphicon-list-alt view_bill  "></button>';

                if (new Date(bill.expiry) >= new Date()) {
                    action += '<button value="' + bill.id + '" type="button" class="btn btn-danger glyphicon glyphicon-trash remove_bill"></button>';
                }
                else {
                    action += '<button disabled value="' + bill.id + '" type="button" class="btn btn-danger glyphicon glyphicon-trash remove_bill"></button>';
                    status = 'EXPIRED';
                }
                action += '</div>';

                let total = 0;
                let payments = [];
                for (payment_info of data[i].bill_payment_infos) {
                    total += parseFloat(payment_info.amount.toFixed(2));
                    payments.push([
                        payment_info.bill_payment_method.name,
                        payment_info.amount.toFixed(2)
                    ]);
                }

                let paymentDiv = '<table class="table custom_table">';
                for (payment of payments) {
                    paymentDiv += '<tr><td>' + payment[0] + '</td><td>:</td> <td>' + payment[1] + '</td></tr>';
                }
                paymentDiv += '</table>';

                    detailTable.row.add([bill.sessionId, bill.billNo, moment(bill.date).format('hh:mm:ss a'),
                        bill.user.username, status,  total, paymentDiv, action]).draw(false);

            }
        }
    }
});