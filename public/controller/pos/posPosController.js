


//////////////////////////////////////////////////////////////////////////////
/**
 * Created by hariharan on 3/26/18.
 */
$(document).ready(function () {

    /**
     * return product click event
     * get bill status and bill info
     */
    $(document).on('click', '.return_product', function (e) {
        var dom = $($(this).parents('.zel'));
        bootbox.prompt({
            size: "small",
            title: "Enter the invoice no",
            callback: function (result) {
                if (result != null) {
                    var billId = result;
                    $.ajax({
                        type: 'POST',
                        url: bill_return,
                        data: {
                            bill_id: result,
                            branch_id: branch
                        },
                        success: function (results) {
                            if (results.status == 200) {
                                returnProductLoad(dom, results.bill);
                            }
                            else {
                                bootbox.alert({
                                    size: "small",
                                    title: "Bill Finding Error",
                                    message: results.message
                                });
                            }
                        }
                    });
                }
            }

        })
    });

    /**
     * load returned bill products on list (without any events - read only)
     * @param dom
     * @param data
     */
    function returnProductLoad(dom, data) {

        var tabDOM = $(dom.parents('.bucket').first()).attr('id');
        if (!bucket[tabDOM]) {
            bucket[tabDOM] = {
                products: [],
                return_flag: true,
                bill_id: data.bill.billNo,
                payments: data.payment,
                pids: [],
                customer: null,
                return_products: [],
                return_tot_products: [],
                return_pids: [],
                loyalty_flag: false,
                used_codes: []
            };



            var items = data.items;
            if (items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    bucket[tabDOM].return_tot_products.push({
                        id: item.productId,
                        name: item.product.productName,
                        cost: item.unitPrice,
                        qty: item.qty,
                        dis: item.discount,
                        tax: item.taxes,
                        item_id: item.id,
                        amount: (item.unitPrice * item.qty + (item.qty * item.unitPrice * (item.taxes / 100)) - (item.qty * item.unitPrice * (item.discount / 100))),
                        available: item.qty
                    });
                    bucket[tabDOM].return_pids.push(item.productId);
                    var cost = (item.qty * item.unitPrice) - (item.qty * item.unitPrice * (item.discount / 100)) + (item.qty * item.unitPrice * (item.taxes / 100));
                    cost = parseFloat(cost);
                    var ret_dis = (item.discount > 0) ? '<br/>' + item.discount + '% discount' : '';
                    var ret_tax = (item.tax > 0) ? ' ' + item.tax + '% tax' : '';
                    var row = '<tr style="opacity: 0.8"><td>' + item.product.productName + '<br/>' +
                        item.qty + ' x ' + item.unitPrice + ret_dis + ret_tax + '</td>' +
                        '<td style="text-align: right;padding-right: 5%">' + cost + '</td>' +
                        '<td style="display: none">' + item.productId + '</td>';
                    $(dom.find('.product_return_table')).append(row);
                    $(dom.find('.qty')).click();
                }
            }
            else {
                delete bucket[tabDOM];
            }




        }
        else {
            bootbox.alert({
                size: "small",
                title: "Tab Busy",
                message: "Current tab is active. Choose another tab"
            });
        }
    }

    /**
     * add new product on list
     */
    $(document).on('click', '.product_add', function () {
        var table = $($(this).parents('.zel').find('.product_add_table'));
        var selected = $(table.find('.trSelect'));
        selected.removeClass('trSelect');

        var id = $(this).attr('id');

        $(this).css('opacity', '0.5');
        $(this).css('border', 'solid 1px #d15a44');
        $(this).addClass('added');

        var tabDOM = $($(this).parents('.bucket').first()).attr('id');

        if (!bucket[tabDOM]) {
            bucket[tabDOM] = {
                products: [],
                pids: [],
                return_flag: false,
                customer: null,
                return_products: [],
                return_pids: [],
                loyalty_flag: false,
                used_codes: []
            }
        }

        /**
         * event error checking
         */
        if (id && id != null) {
            var ids = id.split('-');
            var product = PARENT_PRODUCTS.filter(function (x) {
                return x.product.id === parseInt(ids[1])
            });
            console.log('/////////filter function/////////////')
            console.log('filter function/////////////',product)
            console.log('add produsts evnet errorchkientg');
            console.log('add produsts evnet errorchkientg',bucket[tabDOM]);
            console.log('add produsts evnet errorchkientg');
             var returned = bucket[tabDOM].return_products.filter(function (x) {
                 return x.id === parseInt(ids[1])
             });
         
            console.log('return products',returned)
            console.log('return products')
            if (product && product.length > 0 && bucket[tabDOM].pids.indexOf(parseInt(ids[1])) < 0 && returned.length < 1) {
                var product = product[0];
                bucket[tabDOM].products.push({
                    id: product.product.id,
                    name: product.product.productName,
                    cost: (product.product.sellingPrice),
                    qty: 1,
                    dis: 0,
                    tax: 0,
                    amount: (product.product.sellingPrice),
                    available: product.qty
                });
                bucket[tabDOM].pids.push(product.product.id);
                var row = '<tr class="trSelect ' + tabDOM + product.product.id + '"><td>' + product.product.productName + '<br/>' +
                    '1 x ' + parseFloat(product.product.sellingPrice).toLocaleString('en-US', {minimumFractionDigits:2}) + '</td>' +
                    '<td style="float: right">' + parseFloat(product.product.sellingPrice).toLocaleString('en-US', {minimumFractionDigits:2})+ '</td>' +
                    '<td style="display: none">' + product.product.id + '</td>';
                row += '<td>' +
                    '<button title="remove from list" value="' + product.product.id + '" class="btn btn-danger btn-xs product_remove">' +
                    '<span class="glyphicon glyphicon-remove"></span></button>';
                row += '<button title="return product" value="' + product.product.id + '" class="btn btn-warning btn-xs product_return">' +
                    '<span class="glyphicon glyphicon-level-up"></span></button>';
                row += '</td><tr/>';

                $($(this).parents('.zel').find('.product_add_table')).append(row);
                $($(this).parents('.zel').find('.qty')).click();
                calculateTotal($(this));
            }
        }
        var pd_ser = $(this).parents('.bucket').find('.product_search').first();
        if(pd_ser.val() != ""){
            pd_ser.val("");
            pd_ser.trigger('input');
            console.log("change*****");
        }
        $($(document).find('.bucket.tab-pane.active').find('.product_search')).focus();
    });

    /**
     * product return event
     */
    $(document).on('click', '.product_return', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var ddom = $($(this).parents('.bucket').first());
        var val = $(this).val();
        var id = '#p_select-' + val;


        $(this).parents('tr').css('background', '#FEA2A2');
        $($(document).find('.bucket.tab-pane.active').find('.product_search')).focus();
        /**
         * if product returned with bill
         */
        if (bucket[tabDOM].return_flag) {
            $(this).parents('tr').css('opacity', '0.8');
            var re_product = bucket[tabDOM].return_tot_products.filter(function (x) {
                return x.id === parseInt(val)
            });

            var re_add_product = bucket[tabDOM].products.filter(function (x) {
                return x.id === parseInt(val)
            });

            /**
             * check whether the product available on last bill
             */
            if (re_product && re_product.length > 0) {

                if (re_add_product && re_add_product.length > 0) {

                    var retur_product = bucket[tabDOM].return_products.filter(function (x) {
                        return x.id === parseInt(val)
                    });
                    if (retur_product.length <= 0 && bucket[tabDOM].return_pids.indexOf(parseInt(val)) > -1) {
                        var prd = JSON.parse(JSON.stringify(re_product[0]));
                        /**
                         * check over quantity return limit
                         */
                        if (re_add_product[0].qty > re_product[0].qty) {
                            bootbox.alert({
                                size: "small",
                                title: "Product Over Quantity",
                                message: "This bill have only " + re_product[0].qty + ' number of products in this type'
                            });
                            prd.qty = re_product[0].qty;
                        }

                        else {
                            prd.qty = re_add_product[0].qty;
                        }

                        var p_selected = $($(this).parents('tr'));
                        var cost = (prd.qty) * prd.cost;
                        var dis = (prd.dis > 0) ? prd.dis : 0;

                        var amount = parseFloat(cost - (cost * (dis / 100)) + (cost * (prd.tax / 100))).toFixed(2);
                        prd.amount = amount;

                        /**
                         * change list
                         */
                        if (p_selected.length > 0) {
                            var x = p_selected[0].cells;
                            var disc = (prd.dis > 0) ? prd.dis + '% discount' : '';
                            var x0_html = prd.name + '<br/> ' + prd.qty + ' x ' + prd.cost +
                                ',  ' + disc + ' ' + prd.tax + '% tax';

                            x[0].innerHTML = x0_html;
                            x[1].innerHTML = amount;
                        }

                        bucket[tabDOM].return_products.push(prd);
                        $(this).attr('disabled', 'true');
                    }

                    bucket[tabDOM].products.splice(bucket[tabDOM].products.indexOf(re_add_product[0]), 1);
                    bucket[tabDOM].pids.splice(bucket[tabDOM].pids.indexOf(parseInt(val)), 1);
                    var ddom = $(ddom.find(id));
                    ddom.css('opacity', '1');
                    ddom.css('border', 'solid 1px #4892bb');
                    calculateTotal(ddom);
                }
            }
            else {
                bootbox.alert({
                    size: "small",
                    title: "Product Not Found",
                    message: "This product not found on last bill"
                });
            }

        }
        else {
            /**
             * normal product return
             * @type {Array.<T>}
             */
            var rf_product = bucket[tabDOM].products.filter(function (x) {
                return x.id === parseInt(val)
            });
            var rf_re_product = bucket[tabDOM].return_products.filter(function (x) {
                return x.id === parseInt(val)
            });
            if (rf_product.length > 0 && rf_re_product.length < 1) {

                // bucket[tabDOM].return_flag.push(rf_product[0].return_flag=true);

                bucket[tabDOM].return_products.push(rf_product[0]);

                bucket[tabDOM].return_pids.push(rf_product[0].id);
                $(this).attr('disabled', 'true');
                bucket[tabDOM].products.splice(bucket[tabDOM].products.indexOf(rf_product[0]), 1);
                bucket[tabDOM].pids.splice(bucket[tabDOM].pids.indexOf(rf_product[0].id), 1);
                var cdom = $(ddom.find(id));
                calculateTotal(cdom);
            }
        }
        $($(document).find('.bucket.tab-pane.active').find('.product_search')).focus();

    });

    /**
     * remove selected product from list
     */
    $(document).on('click', '.product_remove', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var ddom = $($(this).parents('.bucket').first());

        $(this).parents('tr').remove();

        var val = $(this).val();
        var id = '#p_select-' + val;
        console.log(bucket[tabDOM]);
        var retur_product = bucket[tabDOM].return_products.filter(function (x) {
            return x.id === parseInt(val)
        });

        if (retur_product.length > 0) {
            bucket[tabDOM].return_products.splice(bucket[tabDOM].return_products.indexOf(retur_product[0]), 1);
            var cdom = $(ddom.find(id));

            cdom.css('opacity', '1');
            cdom.css('border', 'solid 1px #4892bb');
            calculateTotal($(ddom).find('.product_view'));
        }

        var product = bucket[tabDOM].products.filter(function (x) {
            return x.id === parseInt(val)
        });

        if (product.length > 0 && bucket[tabDOM].products.indexOf(product[0]) > -1) {
            bucket[tabDOM].products.splice(bucket[tabDOM].products.indexOf(product[0]), 1);
            bucket[tabDOM].pids.splice(bucket[tabDOM].pids.indexOf(parseInt(val)), 1);
            var cdom = $(ddom.find(id));
            cdom.css('opacity', '1');
            cdom.css('border', 'solid 1px #4892bb');
            calculateTotal($(ddom).find('.product_view'));
        }
        $($(document).find('.bucket.tab-pane.active').find('.product_search')).focus();
    });

    /**
     * remove all products in the list and enable clickable in product list
     */
    $(document).on('click', '.remove_all', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var ddom = $($(this).parents('.bucket').first());
        bucket[tabDOM].products.forEach(function (val) {
            var id = '#p_select-' + val.id;
            var dom = $(ddom.find(id));
            dom.css('opacity', '1');
            dom.css('border', 'solid 1px #4892bb');
        });
        bucket[tabDOM].return_products.forEach(function (val) {
            var id = '#p_select-' + val.id;
            var dom = $(ddom.find(id));
            dom.css('opacity', '1');
            dom.css('border', 'solid 1px #4892bb');
        });

        $($('#' + tabDOM).find('.product_add_table')).html('');
        bucket[tabDOM].products = [];
        bucket[tabDOM].return_products = [];
        bucket[tabDOM].pids = [];
        $($('#' + tabDOM).find('.total_product_amount')).text('0.00');
        $($('#' + tabDOM).find('.total_product_count')).text('0');
    });

    /**
     * remove the current tab
     */
    $(document).on('click', '.tab_remove', function () {
        var id = $($(this).parents('#extend').find(this).parent()).prop('href');
        $(this).parent().parent().remove();
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        delete bucket[tabDOM];
        $('.tab-content ' + '#' + id.split('#')[1]).remove();
        $('#extend').find('li:first').find('a:first').tab('show');
        if ($('#extend').find('li').length < 1) {
            $('.add-one').click();
            $('#extend').find('li:first').find('a:first').tab('show');

        }
        // $(".product_view").load(location.href+" .product_view>*","");
    });

    /**
     * auto select last added product
     */
    $(document).on('click', '.product_add_table tr', function (e) {
        var selected = $(this).parent().find('.trSelect');
        for (var i = 0; i < selected.length; i++) {
            $(selected[i]).removeClass('trSelect');
        }
        $(this).addClass('trSelect');
        var tableData = $(this).children("td").map(function () {
            return $(this).text();
        }).get();
    });

    /**
     * touch keyboard quantity input controller
     */
    $(document).on('click', '.qty', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input').focus();
        //input.focus();
        if (bucket[tabDOM]) {
            clearInputs($(this));
            $(this).css('background', '#4892bb');
            bucket[tabDOM]['key'] = 'qty';
        }
    });


    /*
    $(document).scannerDetection({

        timeBeforeScanTest: 200, // wait for the next character for upto 200ms
        avgTimeByChar: 40, // it's not a barcode if a character takes longer than 100ms
        // preventDefault: true,

        endChar: [13],
        onComplete: function(barcode, qty){
            validScan = true;
            $('#scannerInput').val (barcode);

        } // main callback function	,
        ,
        onError: function(string, qty) {
           console.log(string)
        }
    });
    */

    /**
     *Barcode reading Listner
     */
    var barcode = "";
    $(document).keydown(function (e) {

        var active_tab = $('#extend').find('.active').attr('id');
        console.log(active_tab);

        var code = (e.keyCode ? e.keyCode : e.which);
        var barcodelength = barcode.length;
        if( e.target.nodeName == "INPUT" || e.target.nodeName == "TEXTAREA" )
        {
            return;
        }
        else if ((code == 13) && (barcodelength == 7|| barcodelength == 6))// Enter key hit
        {
            var bod = $('.p'+active_tab).find('.product_search1').first();
            bod.val("");
            console.log(barcode+' barcode value');
            bod.val(barcode).trigger('input');
            //$('.'+active_tab).change();
            barcode = "";
            bod.val(barcode).trigger('input');
            $('.enter').click();
            e.preventDefault();
        }
        else if (code == 13 && barcodelength != 7) {
            barcode = "";
            var bod = $('.p'+active_tab).find('.product_search1').first();
            bod.val("");
            // $('#p'+active_tab).val("");
        }
        else if (code == 8)// Backspace
        {
            var str = barcode;
            var newStr = str.slice(0, -1);
            barcode = newStr;
        }
        else if (code == 96) {
            barcode = barcode + "0";
        }
        else if (code == 97) {
            barcode = barcode + "1";
        }
        else if (code == 98) {
            barcode = barcode + "2";
        }
        else if (code == 99) {
            barcode = barcode + "3";
        }
        else if (code == 100) {
            barcode = barcode + "4";
        }
        else if (code == 101) {
            barcode = barcode + "5";
        }
        else if (code == 102) {
            barcode = barcode + "6";
        }
        else if (code == 103) {
            barcode = barcode + "7";
        }
        else if (code == 104) {
            barcode = barcode + "8";
        }
        else if (code == 105) {
            barcode = barcode + "9";
        }
        else {
            barcode = barcode + String.fromCharCode(code);
        }
    });

    /**
     * touch keyboard tax input controller
     */
    $(document).on('click', '.tax', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
        input.focus();
        if (bucket[tabDOM]) {
            clearInputs($(this));
            $(this).css('background', '#4892bb');
            bucket[tabDOM]['key'] = 'tax';
        }

    });

    /**
     * touch keyboard tax input controller
     */
    $(document).on('click', '.loyalty_dis', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
        var dis = $(this).parents('.zel').find('.pos_controller').find('.discount');
        console.log(input);
        input.focus();
        if (bucket[tabDOM]) {
            clearInputs($(this));
            $(this).css('background', '#00a65a');
            $(dis).css('background', '#00a65a');
            bucket[tabDOM]['key'] = 'dis';
            bucket[tabDOM]['type'] = 'loy';
            console.log(bucket[tabDOM]);

            if (bucket[tabDOM].loyalty_flag) {
                load_promo_window($(this), bucket[tabDOM])
            }
            else {
                bootbox.alert('You need to add customer first !!');
                clearInputs($(this));
            }
        }

    });

    /**
     * touch keyboard tax input controller
     */
    $(document).on('click', '.normal_dis', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
        var dis = $(this).parents('.zel').find('.pos_controller').find('.discount');
        input.focus();
        if (bucket[tabDOM]) {
            clearInputs($(this));
            $(this).css('background', '#00a65a');
            $(dis).css('background', '#4892bb');
            bucket[tabDOM]['key'] = 'dis';
            bucket[tabDOM]['type'] = 'nor';
            console.log(bucket[tabDOM])
        }

    });

    /**
     * touch keyboard discount input controller
     */
    $(document).on('click', '.discount', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
        input.focus();
        if (bucket[tabDOM]) {
            clearInputs($(this));
            $(this).css('background', '#4892bb');
            bucket[tabDOM]['key'] = 'dis';
            console.log(bucket[tabDOM]);
        }
    });

    /**
     * clear all input types
     * @param dom
     */
    function clearInputs(dom) {
        $(dom.parents('.pos_controller').find('.qty')).css('background', '#e8e8e8');
        $(dom.parents('.pos_controller').find('.discount')).css('background', '#e8e8e8');
        $(dom.parents('.pos_controller').find('.normal_dis')).css('background', '#4892bb');
        $(dom.parents('.pos_controller').find('.loyalty_dis')).css('background', '#4892bb');
        $(dom.parents('.pos_controller').find('.tax')).css('background', '#e8e8e8');
        $(dom.parents('.zel').find('.pos_input_tab').find('.pos_input')).val('1');
        var tabDOM = $(dom.parents('.bucket').first()).attr('id');
        (bucket[tabDOM]) ? bucket[tabDOM]['key'] = 'none' : 0;
        (bucket[tabDOM]) ? bucket[tabDOM]['type'] ? bucket[tabDOM]['type'] = 'none' : 0 : 0;
    }

    /**
     * calculate current total
     * @param dom
     */
    function calculateTotal(dom) {
        var table = $(dom.parents('.zel').find('.product_add_table'));
        var total = 0;
        var tabDOM = $(dom.parents('.bucket').first()).attr('id');
        var totalproducts = 0;
        /**
         * calculate product total
         */
        console.log(bucket[tabDOM]);
        if (bucket[tabDOM]) {
            /**
             * new products total
             */
            for (var i = 0; i < bucket[tabDOM].products.length; i++) {
                if (bucket[tabDOM].products[i]) {
                    //alert(bucket[tabDOM].products[i].amount);
                    total = total + parseFloat(bucket[tabDOM].products[i].amount);
                    totalproducts += parseInt(bucket[tabDOM].products[i].qty);
                }

            }

            /**
             * returned product total
             */
            for (var i = 0; i < bucket[tabDOM].return_products.length; i++) {
                if (bucket[tabDOM].return_products[i]) {
                    //alert(bucket[tabDOM].products[i].amount);
                    total = total - parseFloat(bucket[tabDOM].return_products[i].amount);

                }
            }

        }
        $(dom.parents('.zel').find('.total_product_amount')).text(parseFloat(total + '').toLocaleString('en-US', {minimumFractionDigits:2}));
        $(dom.parents('.zel').find('.total_product_count')).text(totalproducts);
    }

    /**
     * touch key board control only for digits
     */
    $(document).on('click', '.pos_controller th', function () {
        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        if (bucket[tabDOM] && bucket[tabDOM]['key'] != 'none') {
            var column_num = parseInt($(this).index()) + 1;
            var row_num = parseInt($(this).parent().index());
            var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
            if ((row_num < 3 && column_num < 4)) {
                var qty = (row_num * 3 + column_num);
                input.val(input.val() + qty);
            }
            else if (row_num == 3 && column_num == 2) {
                input.val(input.val() + 0);
            }
        }
    });

    /**
     * delete last input
     */
    $(document).on('click', '.del', function () {
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
        input.val(input.val().slice(0, -1));

    });


    /**
     * Enter Input to apply changes
     * */
    $(document).on('click', '.enter', function () {

        var activeCell = $(this).parents('.pos_controller').find('[style~="backgroundColor: green;"]');

        var tabDOM = $($(this).parents('.bucket').first()).attr('id');
        var input = $(this).parents('.zel').find('.pos_input_tab').find('.pos_input');
        var table = $($(this).parents('.zel').find('.product_add_table'));

        var selected = $(table.find('.trSelect'));

        if (selected && selected.length > 0) {

            var rowIndex = selected[0].rowIndex;
            var x = selected[0].cells;
            var pid = x[2].innerHTML;

            var product = bucket[tabDOM].products.filter(function (x) {
                return x.id === parseInt(pid)
            });

            var et_re_product = bucket[tabDOM].return_products.filter(function (x) {
                return x.id === parseInt(pid)
            });

            /**
             * if the product is returned product or added product
             * discount and tax input changes not apply for returened products
             */
            if (et_re_product.length > 0 || product.length > 0) {

                product = (et_re_product.length > 0) ? et_re_product[0] : product[0];
                var key = bucket[tabDOM]['key']; /* input type*/

                if (key == 'qty') {
                    var qty = (input.val() != "") ? parseInt(input.val()) : 1;
                    /**
                     * if returned product with bill no check the last bill (checking quantities)
                     */
                    if (bucket[tabDOM].return_flag && et_re_product.length > 0) {
                        var check_product = bucket[tabDOM].return_tot_products.filter(function (x) {
                            return x.id === product.id
                        });
                        if (check_product.length > 0 && (qty > check_product[0].qty)) {
                            bootbox.alert('Existing bill have ' + check_product[0].qty + ' only !!');
                            qty = check_product[0].qty
                        }
                    }
                    var disc = (product.dis > 0) ? product.dis + '% discount' : '';

                    var xhtml = product.name + '<br/> ' + qty + ' x ' + product.cost +
                        ',  ' + disc;
                    xhtml += (product.tax > 0) ? ' ' + product.tax + ' % tax' : '';
                    x[0].innerHTML = xhtml;

                    var cost = qty * product.cost;
                    var dis = (product.dis > 0) ? product.dis : 0;
                    var amount = parseFloat(cost - (cost * (dis / 100)) + (cost * (product.tax / 100)));

                    x[1].innerHTML = amount;
                    product.qty = qty;
                    product.amount = amount.toFixed(2);
                }
                else if (key == 'dis') {
                    if (et_re_product.length < 1) {
                        var temp_val = (input.val() != "") ? parseFloat(input.val()) : 0;
                        var xhtml = product.name + ' <br/> ' + product.qty + ' x ' + product.cost +
                            ',  ' + temp_val + '% discount';
                        xhtml += (product.tax > 0) ? ' ' + product.tax + ' % tax' : '';
                        x[0].innerHTML = xhtml;
                        var cost = product.cost * product.qty;
                        var dis = (temp_val > 0) ? temp_val : 0;
                        var amount = parseFloat(cost - (cost * (dis / 100)) + (cost * (product.tax / 100)));
                        x[1].innerHTML = amount;
                        product.dis = dis;
                        product.amount = amount.toFixed(2);
                    }
                }
                else if (key == 'tax') {
                    if (et_re_product.length < 1) {
                        var temp_val = (input.val() != "") ? parseInt(input.val()) : 0;
                        var disc = (product.dis > 0) ? product.dis + '% discount' : '';
                        var xhtml = product.name + '<br/> ' + product.qty + ' x ' + product.cost +
                            ',  ' + disc;
                        xhtml += (temp_val > 0) ? ' ' + temp_val + ' % tax' : '';
                        x[0].innerHTML = xhtml;
                        var cost = product.cost * product.qty;
                        var dis = (product.dis > 0) ? product.dis : 0;
                        var tax = (temp_val > 0) ? temp_val : 0;
                        var amount = parseFloat(cost - (cost * (dis / 100)) + (cost * (temp_val / 100)));
                        x[1].innerHTML = amount;
                        product.tax = temp_val;
                        product.amount = amount.toFixed(2);
                    }
                }
            }
            calculateTotal($(this));
        }
        console.log(bucket[tabDOM]);
        clearInputs($(this));
        $('.product_search1').val("");
    });
    /**
     * keyboad input 'enter' key listiner
     */
    $(document).keypress(function (e) {
        if (e.which == 13) {
            $('.enter').click();
        }
    });

    /**
     * key input validate
     */
    $(".pos_input").keyup(function(){
        var value = $(this).val();
        value = value.replace(/^(0*)/,"");
        value = value.replace(/[^0-9]/g, '');
        $(this).val(value);
    });

});