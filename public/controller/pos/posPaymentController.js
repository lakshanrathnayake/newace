/**
 * Created by hariharan on 3/26/18.
 */
$(document).ready(function () {
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////// pos payment controller //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *
     * pos payment controller
     */
    $(document).on('click', '.pos_payment', function () {

        $(document).ready(function () {
            $("#cash").trigger('click');
        });


        var tabDOM = $($(this).parents('.bucket').first()).attr('id');

        var table = $($(this).parents('.zel').find('.product_add_table'));
        var trs = table.find('tr');
        var data = [];
        var total = 0;
        var dis_amount12 = 0;
        var tax_amount12 = 0;
        var p_total = 0;
        var nop = 0;
        var return_total = 0;
        var pay_total_ammount = 0;

        var paym = $($(this).parents('.bucket').find('.pos_pay_slide'));
        paym.off();

        var verify = $(paym.find('.cash_verify'));
        var invoice = $(paym.find('.invoice_btn'));
        var pay_customer = $(paym.find('.pay_customer'));

        /**
         * calculate product total
         */
        if (bucket[tabDOM]) {
            /**
             * added product total
             */

            for (var i = 0; i < bucket[tabDOM].products.length; i++) {
                if (bucket[tabDOM].products[i]) {
                    total = total + parseFloat(bucket[tabDOM].products[i].amount);
                    nop += bucket[tabDOM].products[i].qty;
                }
            }
            /**
             * returned product total if available
             */
            for (var i = 0; i < bucket[tabDOM].return_products.length; i++) {
                if (bucket[tabDOM].return_products[i]) {
                    return_total = return_total + parseFloat(bucket[tabDOM].return_products[i].amount);
                    bucket[tabDOM].returen_total = return_total;
                }
            }

            total = total - return_total;
            /* payable amount */

            p_total = total;
        }

        /**
         * current tab variables
         * @type {*|jQuery|HTMLElement}
         */
        var pos = $($(this).parents('.bucket').find('.zel'));
        var pos_invoice_cus = $(paym.find('.pos_invoice_cus'));

        var tax_pay = $(paym.find('.tax_pay'));
        var discount_pay = $(paym.find('.discount_pay'));
        var return_cash_pay = $(paym.find('.return_cash_pay'))

        /**
         * payment methods activation display buttons
         * @type {*|jQuery|HTMLElement}
         */
        var cash = $(paym.find('.cash_pay'));
        var credit = $(paym.find('.credit_pay'));
        var gift = $(paym.find('.gift_pay'));
        var loyalty = $(paym.find('.loyalty_pay'));
        var loyalty_pt = $(paym.find('.loyalty_pt_pay'));
        var tot = $(paym.find('.total'));
        var tot_nop = $(paym.find('.tot_nop'));
        var tot_bill = $(paym.find('.tot_bill'));
        var tot_tax = $(paym.find('.tot_tax'));
        var tot_dis = $(paym.find('.tot_discount'));
        var tot_ret = $(paym.find('.tot_return_cash'));
        var auto_click = $(paym.find('.cash'));


        /**
         * payment methods inputs
         * @type {*|jQuery|HTMLElement}
         */
        var input = $(paym.find('.cash_gave'));
        var tax_gave = $(paym.find('.tax_gave'));
        var gift_gave = $(paym.find('.gift_gave'));
        var loyalty_gave = $(paym.find('.loyalty_gave'));
        var discount_gave = $(paym.find('.discount_gave'));
        var return_cash_gave = $(paym.find('.return_cash_gave'));

        var discount_per = $(paym.find('.discount_per'));

        var credit_input = $(paym.find('.credit_gave'));
        var credit_ref = $(paym.find('.credit_ref'));
        var gift_ref = $(paym.find('.gift_ref'));
        var loyalty_ref = $(paym.find('.loyalty_ref'));
        var loyalty_pt_gave = $(paym.find('.loyalty_pt_gave'));
        var loyalty_pt_ref = $(paym.find('.loyalty_pt_ref'));
        var balance = $(paym.find('.cash_balance'));

        var loyalty_pay_customer = $(paym.find('.loyalty_pay_customer'));
        var loyalty_pay_loyalty = $(paym.find('.loyalty_pay_loyalty'));

        /**
         * payment history display buttons
         * @type {*|jQuery|HTMLElement}
         */
        var cash_amount = $(paym.find('.cash_amount'));
        var credit_amount = $(paym.find('.credit_amount'));
        var gift_amount = $(paym.find('.gift_amount'));
        var loyalty_amount = $(paym.find('.loyalty_amount'));
        var loyalty_pt_amount = $(paym.find('.loyalty_pt_amount'));
        var tax_amount = $(paym.find('.tax_amount'));
        var discount_amount = $(paym.find('.discount_amount'));
        var dis_type = $(paym.find('.dis_type'));
        var return_cash_amount = $(paym.find('.return_cash_amount'));
        var return_cash_button = $(paym.find('.return_cash_payment'));

        /**
         * paid and balance input
         * @type {*|jQuery|HTMLElement}
         */
        var paid_total = $(paym.find('.paid_total'));
        var need_paid = $(paym.find('.need_paid'));

        /**
         * default cash payment method
         * @type {string}
         */
        var pay_mode = 'cash';

        var auto_credit = 0;

        /**
         * invoice dom
         * @type {*|jQuery|HTMLElement}
         */
        var invoiceDom = $(paym.parents('.bucket').find('.pos_pay_invoice'));
        invoiceDom.off();

        var gift_tot = 0;

        /**
         * initial values when payment page loaded
         */
        //if(bucket[tabDOM] && bucket[tabDOM].customer != null){
        if (bucket[tabDOM]) {
            loadAmounts();
            pos.hide();


            tot_nop.text(nop);

            tot_ret.text('Rs. '+'0.00');
            tot_dis.text('Rs. '+'0.00');
            discount_per.val('Rs');
            tot_bill.text('Rs.' + (total).toLocaleString('en-US', {minimumFractionDigits:2}));
            tot.text(total.toFixed(2));


            if (total < 0) {

                tot_ret.val(total);
                return_cash_amount.text(total);
                tot_ret.text('Rs.' + (total));
                input.prop('disabled', true);
                return_cash_button.prop('disabled', false);
                credit_input.prop('disabled', true);
                credit_ref.prop('disabled', true);
                gift_gave.prop('disabled', true);
                gift_ref.prop('disabled', true);
                tax_gave.prop('disabled', true);
                discount_gave.prop('disabled', true);
                var rt = parseFloat(Math.abs(tot.html()));
                need_paid.val((parseFloat(total) - parseFloat(paid_total.val())).toFixed(2));
            }
            else {
                input.prop('disabled', false);
                return_cash_button.prop('disabled', true);
                credit_input.prop('disabled', false);
                credit_ref.prop('disabled', false);
                gift_gave.prop('disabled', false);
                gift_ref.prop('disabled', false);
                tax_gave.prop('disabled', false);
                discount_gave.prop('disabled', false);
                need_paid.val((parseFloat(total) - parseFloat(paid_total.val())).toFixed(2));


            }

            console.log(bucket[tabDOM]);
            pay_customer.text((bucket[tabDOM].customer != null) ? bucket[tabDOM].customer_id + ':' + bucket[tabDOM].customer : '0:Visitor');
            paym.show();
            input.focus();
        }
        else {
            bootbox.alert({
                size: "small",
                title: "Products Not Found",
                message: "Add at least one product !!"
            });
        }

        /**
         * back to pos
         */
        paym.on('click', '.back_pos', function () {
            bac();
        });
        function bac(){
            pos.show();
            paym.hide();
            hidePayType();
            hideExtara();
            offEvents();
            paym.off();
            $($(document).find('.bucket.tab-pane.active').find('.product_search')).focus();
        }

        /**
         * percentage discount click
         */
        paym.on('click', '.discount_perce', function () {
            discount_per.val('%');
            dis_type.text('(%)');
            tot_dis.text(discount_amount.html()+' '+ ' %');
            loadAmounts();
        });

        /**
         * cash discount click
         */
        paym.on('click', '.discount_cash', function () {
            discount_per.val('Rs');
            dis_type.text('(Rs)');
            tot_dis.text('Rs.' + parseFloat(discount_amount.html()).toLocaleString('en-US', {minimumFractionDigits:2}));
            loadAmounts();
        });

        /**
         * clear input events
         */
        function offEvents() {
            credit_input.off();
            input.off();
            tax_gave.off();
            gift_gave.off();
            discount_gave.off();
            return_cash_gave.off();
            invoiceDom.off();
        }
        /**
         * tax input event
         */
        tax_gave.on('input', function () {
            if ($(this).val() && $(this).val() != null) {
                tax_amount.html(parseFloat($(this).val()));
            }
            else {
                tax_amount.html(0);
            }
            tot_tax.text(tax_amount.html() +' '+' %');
            loadAmounts();
        });

        /**
         * return cash input event
         */
        return_cash_gave.on('input', function () {
            //console.log($(this).val());

            if (($(this).val() && $(this).val() != null)) {
                return_cash_amount.html("-" + parseFloat($(this).val()).toFixed(2));


            } else {
                return_cash_amount.html(0.00);

            }
            tot_ret.text('Rs.' + parseFloat(return_cash_amount.html()).toLocaleString('en-US', {minimumFractionDigits:2}));
            loadAmounts();
        });

        /**
         * discount input event
         */
        discount_gave.on('input', function () {
            var tag = false;
            var type = '';
            if (discount_per.val() == '%') {
                tag = true;
                type = '%';
                dis_type.text('(%)');
            }
            else if (discount_per.val() == 'Rs') {
                tag = true;
                type = 'Rs.';
                dis_type.text('(Rs)');
            }

            if (tag) {
                if ($(this).val() && $(this).val() != null) {
                    discount_amount.html(parseFloat($(this).val()));
                }
                else {
                    discount_amount.html(0);
                }
                if (type == '%') {
                    tot_dis.text(discount_amount.html()+' ' + type);
                }else {
                    tot_dis.text(type + ' ' +parseFloat(discount_amount.html()).toLocaleString('en-US', {minimumFractionDigits:2}));
                }
                loadAmounts();
            }

        });

        /**
         * gift input event
         */
        gift_gave.on('input', function () {
            if ($(this).val() && $(this).val() != null) {
                gift_amount.html(parseFloat($(this).val()));
            }
            else {
                gift_amount.html(0);
            }
            loadAmounts();

        });

        /**
         * loyalty input event
         */
        loyalty_gave.on('input', function () {
            if ($(this).val() && $(this).val() != null) {
                loyalty_amount.html(parseFloat($(this).val()));
            }
            else {
                loyalty_amount.html(0);
            }
            loadAmounts();

        });

        /**
         * loyalty input event
         */
        loyalty_pt_gave.on('input', function () {
            if ($(this).val() && $(this).val() != null) {
                loyalty_pt_amount.html(parseFloat($(this).val()));
            }
            else {
                loyalty_pt_amount.html(0);
            }
            loadAmounts();

        });

        /**
         * cash paid input event
         */
        input.on('input', function () {
            if ($(this).val() && $(this).val() != null) {
                cash_amount.html(parseFloat($(this).val()));
            }
            else {
                cash_amount.html(0);
            }
            loadAmounts();
        });


        /**
         * credit card payment input event
         * auto completion based on other payments
         */
        credit_input.on('input', function () {
            gift_tot = parseFloat(gift_amount.html());
            if (credit_input.val() && credit_input.val() != null) {
                var credit_cash_amount = parseFloat(credit_input.val());
                if ((parseFloat(cash_amount.html()) + credit_cash_amount + gift_tot) > pay_total_ammount) {
                    var am = pay_total_ammount - ( gift_tot + parseFloat(cash_amount.html()));
                    credit_cash_amount = (am < 0) ? 0 : am;
                }
                credit_amount.html(parseFloat(credit_cash_amount + '').toFixed(2));
                credit_input.val(credit_cash_amount);
            }
            else {
                credit_amount.html(0);
                $(this).val(0);
            }
            loadAmounts();
        });

        /**
         * re-calculate amounts
         */
        function loadAmounts() {

            var tax = parseFloat(tax_amount.html());
            var discount = parseFloat(discount_amount.html());
            var recash = parseFloat(return_cash_amount.html());
            //var loyalty = parseFloat(loyalty_amount.html());
            var loyalty_pt = parseFloat(loyalty_pt_amount.html());
            gift_tot = parseFloat(gift_amount.html());
            tax_amount12 = ((tax && tax > 0) ? (total * (tax / 100)) : 0);
            var pay_total = total + tax_amount12 ;

            pay_total = parseFloat(pay_total).toFixed(2);

            if (discount && discount > 0 && discount_per.val() == '%') {
                dis_amount12 = total * (discount / 100);
                dis_amount12  =  dis_amount12.toFixed(2);
                pay_total -= dis_amount12;
            }
            else if (discount && discount > 0 && discount_per.val() == 'Rs') {
                pay_total -= discount;
            }


            //if(loyalty > 0){
            //    pay_total -= total * (loyalty / 100);
            //}

            if (pay_total < 0) {
                pay_total = recash;
                tot.text(pay_total.toFixed(2));
                pay_total_ammount = parseFloat(tot.text());
                paid_total.val(((gift_tot + parseFloat(cash_amount.html()) + parseFloat(credit_amount.html()))
                    + parseFloat(loyalty_pt_amount.html()) + (parseFloat(loyalty_amount.html()) * total / 100)).toFixed(2));
                var need_bal = pay_total - parseFloat(paid_total.val());
                need_paid.val(parseFloat(need_bal + '').toFixed(2));
            }
            else {
                tot.text(pay_total);
                pay_total_ammount = parseFloat(tot.text());
                paid_total.val(((gift_tot + parseFloat(cash_amount.html()) + parseFloat(credit_amount.html()))
                    + parseFloat(loyalty_pt_amount.html()) + (parseFloat(loyalty_amount.html()) * total / 100)).toFixed(2));
                var need_bal = pay_total - parseFloat(paid_total.val());
                need_paid.val(parseFloat(need_bal + '').toFixed(2));


            }


            /**
             * trigger the invoice and payment submission button visible
             */
            if (need_paid.val() <= 0) {
                invoice.prop('disabled', false);
                if (bucket[tabDOM]) {
                    bucket[tabDOM].cash = (parseFloat(cash_amount.html())) ? parseFloat(cash_amount.html()) : 0;
                    bucket[tabDOM].credit = (parseFloat(credit_amount.html())) ? parseFloat(credit_amount.html()) : 0;
                    bucket[tabDOM].credit_ref = credit_ref.val();
                    bucket[tabDOM].gift = (parseFloat(gift_amount.html())) ? parseFloat(gift_amount.html()) : 0;
                    bucket[tabDOM].gift_ref = gift_ref.val();
                    bucket[tabDOM].loyalty = (parseFloat(loyalty_amount.html())) ? parseFloat(loyalty_amount.html()) : 0;
                    bucket[tabDOM].loyalty_ref = loyalty_ref.val();
                    bucket[tabDOM].loyalty_pt = (parseFloat(loyalty_pt_amount.html())) ? parseFloat(loyalty_pt_amount.html()) : 0;
                    bucket[tabDOM].loyalty_pt_ref = loyalty_pt_ref.val();
                    bucket[tabDOM].total = total;
                    bucket[tabDOM].paid_total = pay_total_ammount;
                    bucket[tabDOM].balance = parseFloat(need_paid.val());
                    bucket[tabDOM].tax = (parseFloat(tax_amount.html())) ? parseFloat(tax_amount.html()) : 0;
                    bucket[tabDOM].recash = (parseFloat(return_cash_amount.html())) ? parseFloat(return_cash_amount.html()) : 0;
                    bucket[tabDOM].discount = (parseFloat(discount_amount.html())) ? parseFloat(discount_amount.html()) : 0;
                    bucket[tabDOM].discount_type = discount_per.val();
                    bucket[tabDOM]['is_generated'] = false;
                    bucket[tabDOM]['unique'] = Date.now().toString() + '/' + sessionId;
                }
            }
            else {

                invoice.prop('disabled', true);
            }
            auto_credit = need_paid.val();
            console.log(bucket[tabDOM]);
        }


        /**
         * payment keyboard controller (touch)
         */
        paym.on('click', '.pos_payment_controller th', function () {
            var column_num = parseInt($(this).index()) + 1;
            var row_num = parseInt($(this).parent().index());
            var smo = 0;
            var cmo = 0;
            var gift = 0;
            var tax = 0;
            var discount = 0;
            var recash = 0;

            var paym_input = $(paym.find('.pay_input'));
            var paym_val = 0;

            if ((row_num < 3 && column_num < 4)) {
                var qty = (row_num * 3 + column_num);
                smo = parseFloat(input.val() + qty + '');
                cmo = parseFloat(credit_input.val() + qty + '');
                paym_val = parseFloat(paym_input.val() + qty + '');
            }
            else if (row_num == 3 && column_num == 1) {
                smo = parseFloat(input.val() + 0 + '');
                cmo = parseFloat(credit_input.val() + 0 + '');
                paym_val = parseFloat(paym_input.val() + 0 + '');
            }
            else if (row_num == 3 && column_num == 2) {
                smo = input.val() + '.';
                cmo = credit_input.val() + '.';
                paym_val = paym_input.val() + '.';
            }
            else if (row_num == 3 && column_num == 3) {
                smo = input.val().slice(0, -1);
                cmo = credit_input.val().slice(0, -1);
                paym_val = paym_input.val().slice(0, -1);
            }

            /**
             * touch events based on payment type input
             */
            if (pay_mode == 'cash') {
                input.val(smo);
                if (input.val() && input.val() != null) {
                    cash_amount.html(parseFloat(input.val()));
                }
                else {

                    cash_amount.html(0);
                }
            }
            else if (pay_mode == 'credit') {
                credit_input.val(cmo);
                gift_tot = parseFloat(gift_amount.html());
                if (credit_input.val() && credit_input.val() != null) {
                    var credit_cash_amount = parseFloat(credit_input.val());
                    if ((parseFloat(cash_amount.html()) + credit_cash_amount + gift_tot) > pay_total_ammount) {
                        var am = pay_total_ammount - ( gift_tot + parseFloat(cash_amount.html()));
                        credit_cash_amount = (am < 0) ? 0 : am;
                    }
                    credit_input.val(credit_cash_amount);
                    credit_amount.html(parseFloat(credit_cash_amount + '').toFixed(2));
                }
                else {
                    credit_amount.html(0);
                    credit_input.val(0);
                }
            }
            else if (pay_mode == 'gift') {
                gift_gave.val(paym_val);
                if (gift_gave.val() && gift_gave.val() != null) {
                    gift_amount.html(parseFloat(gift_gave.val()));
                }
                else {
                    gift_amount.html(0);
                }
            }
            else if (pay_mode == 'tax') {
                tax_gave.val(paym_val);
                if (tax_gave.val() && tax_gave.val() != null) {
                    tax_amount.html(parseFloat(tax_gave.val()));
                }
                else {
                    tax_amount.html(0);
                }
                tot_tax.text(tax_amount.html() +' ' + '%');
            }
            else if (pay_mode == 'discount') {

                discount_gave.val(paym_val);
                if (discount_gave.val() && discount_gave.val() != null) {
                    discount_amount.html(parseFloat(discount_gave.val()));
                }
                else {
                    discount_amount.html(0);
                }
                if (discount_per.val() == '%') {
                    tot_dis.text(discount_amount.html() + ' ' + discount_per.val());
                }else {
                    tot_dis.text(discount_per.val() + ' ' +parseFloat(discount_amount.html()).toFixed(2));
                }
            }

            else if (pay_mode == 'recash') {

                return_cash_gave.val(paym_val);
                if (return_cash_gave.val() && return_cash_gave.val() != null) {
                    return_cash_amount.html(parseFloat(return_cash_gave.val()));


                }
                else {
                    return_cash_amount.html(0);

                }
                tot_ret.text('Rs' +' '+ parseFloat(return_cash_amount.html()).toFixed(2));
            }
            loadAmounts();
        });
        /**
         * select cash type pay option
         */
        paym.on('click', '.cash', function () {

            hidePayType();
            removeActiveInput();
            input.addClass("pay_input");
            cash.show();
            input.focus();
            pay_mode = 'cash';
        });

        /**
         * select credit type pay option
         */
        paym.on('click', '.credit', function () {
            hidePayType();
            cash.hide();
            removeActiveInput();
            credit_amount.addClass("pay_input");
            credit.show();
            credit_amount.html(0);
            loadAmounts();
            auto_credit = (auto_credit < 0) ? 0 : auto_credit;
            credit_amount.html(auto_credit);
            credit_input.val(auto_credit);
            loadAmounts();
            credit_input.focus();
            pay_mode = 'credit';
        });

        /**
         * refresh type pay option
         */
        function removeActiveInput() {
            input.removeClass("pay_input");
            credit_input.removeClass("pay_input");
            tax_gave.removeClass("pay_input");
            discount_gave.removeClass("pay_input");
            gift_gave.removeClass("pay_input");
            return_cash_gave.removeClass("pay-input");
        }
        /**
         * select gift type pay option
         */
        paym.on('click', '.gift', function () {
            hidePayType();
            cash.hide();
            removeActiveInput();
            gift_gave.addClass("pay_input");
            gift.show();
            gift_gave.focus();
            pay_mode = 'gift';
        });

        paym.on('click', '.loyalty_pt', function () {
            hidePayType();
            cash.hide();
            loyalty_pt.show();
            pay_mode = 'loyalty_pt';
            loyaltyValidation($(this), bucket[tabDOM]);
        });


        function loyaltyValidation(dom, bucket) {
            if (bucket && bucket.customer != null) {
                var loyalty_customer_model = $($(dom).parents('.pos_pay_slide').find('.loyalty_pay_model'));
                var use_code_btn = $($(loyalty_customer_model).find('.use_pay_code'));

                loyalty_customer_model.off();
                loyalty_pay_customer.val(bucket.customer);
                loyalty_pay_loyalty.val(bucket.loyaltyReference);
                loyalty_customer_model.modal('show');
                $(loyalty_customer_model).find('.promo_pay_info').hide();
                $(loyalty_customer_model).find('.promo_pay_suc').hide();
                $(loyalty_customer_model).find('.promo_pay_unsuc').hide();
                use_code_btn.html('use code');
                use_code_btn.addClass('btn-primary');

                loyalty_customer_model.on('click', '.validate_pay_code', function () {
                    use_code_btn.val("");
                    use_code_btn.removeClass('btn-warning');

                    if (navigator.onLine) {
                        if (pay_mode == 'loyalty') {
                            promo_validity(1, $(loyalty_customer_model.find('.loyalty_pay_promo_code')).val(), function (status, results) {
                                if (status) {
                                    var code = $(loyalty_customer_model.find('.loyalty_pay_promo_code')).val();
                                    use_code_btn.val(code);

                                    if (results.validity) {
                                        loyalty_gave.attr('disabled', false);
                                        if (bucket.boucher_code != undefined && bucket.boucher_code != null) {
                                            use_code_btn.addClass('btn-warning');
                                            use_code_btn.html('un-use code')
                                        }
                                        $(loyalty_customer_model).find('.promo_pay_info').show();
                                        $(loyalty_customer_model).find('.promo_pay_suc').show();
                                    }
                                    else if (results.status == 400 && !results.validity) {
                                        loyalty_gave.attr('disabled', true);
                                        $(loyalty_customer_model).find('.promo_pay_info').show();
                                        $(loyalty_customer_model).find('.promo_pay_unsuc').show();
                                    }
                                    else {
                                        loyalty_gave.attr('disabled', true);
                                        bootbox.alert('Can not make loyalty discount now !!');
                                    }
                                }
                                else {
                                    bootbox.alert('Server error try again later !!');
                                }
                            });
                        } else if (pay_mode == 'loyalty_pt') {
                            promo_validity(0, $(loyalty_customer_model.find('.loyalty_pay_promo_code')).val(), function (status, results) {
                                if (status) {
                                    var code = $(loyalty_customer_model.find('.loyalty_pay_promo_code')).val();
                                    use_code_btn.val(code);

                                    if (results.validity) {
                                        loyalty_pt_gave.attr('disabled', false);
                                        if (bucket.redemed_code != undefined && bucket.redemed_code != null) {
                                            use_code_btn.addClass('btn-warning');
                                            use_code_btn.html('un-use code')
                                        }
                                        $(loyalty_customer_model).find('.promo_pay_info').show();
                                        $(loyalty_customer_model).find('.promo_pay_suc').show();
                                    }
                                    else if (results.status == 400 && !results.validity) {
                                        loyalty_pt_gave.attr('disabled', true);
                                        $(loyalty_customer_model).find('.promo_pay_info').show();
                                        $(loyalty_customer_model).find('.promo_pay_unsuc').show();
                                    }
                                    else {
                                        loyalty_pt_gave.attr('disabled', true);
                                        bootbox.alert('Can not make loyalty discount now !!');
                                    }
                                }
                                else {
                                    bootbox.alert('Server error try again later !!');
                                }
                            });
                        }
                    }
                    else {
                        bootbox.alert('Internet Connection not available now !!!');
                    }
                });

                loyalty_customer_model.on('click', '.use_pay_code', function () {
                    var p_code = $(this).val();
                    if (pay_mode == 'loyalty') {
                        if (bucket.boucher_code == undefined || bucket.boucher_code == null) {
                            bucket.boucher_code = p_code;
                            loyalty_ref.val(p_code);
                            use_code_btn.addClass('btn-warning');
                            use_code_btn.removeClass('btn-primary');
                            use_code_btn.html('un-use code');
                            loyalty_gave.attr('disabled', false);
                        }
                        else {
                            bucket.loyalty_ref = null;
                            bucket.loyalty_amount = 0;
                            loyalty_amount.html('0');
                            loyalty_gave.val(0);
                            loyalty_ref.val('');
                            loyalty_gave.attr('disabled', true);
                            bucket.boucher_code = null;
                            use_code_btn.addClass('btn-primary');
                            use_code_btn.removeClass('btn-warning');
                            use_code_btn.html('use code');
                            loadAmounts();
                        }
                    }
                    else if (pay_mode == 'loyalty_pt') {
                        if (bucket.redemed_code == undefined || bucket.redemed_code == null) {
                            bucket.redemed_code = p_code;
                            loyalty_pt_ref.val(p_code);
                            use_code_btn.addClass('btn-warning');
                            use_code_btn.removeClass('btn-primary');
                            use_code_btn.html('un-use code');
                            loyalty_pt_gave.attr('disabled', false);
                        }
                        else {
                            bucket.loyalty_pt_ref = null;
                            bucket.loyalty_pt_amount = 0;
                            loyalty_pt_amount.html('0');
                            loyalty_pt_gave.val(0);
                            loyalty_pt_ref.val('');
                            loyalty_pt_gave.attr('disabled', true);
                            bucket.redemed_code = null;
                            use_code_btn.addClass('btn-primary');
                            use_code_btn.removeClass('btn-warning');
                            use_code_btn.html('use code');
                            loadAmounts();
                        }
                    }
                });
            }
            else {
                bootbox.alert('Customer not found, Please add customer first !!');
            }
        }

        /**
         * select loyalty type pay option
         */
        paym.on('click', '.loyalty', function () {
            hidePayType();
            cash.hide();
            loyalty.show();
            pay_mode = 'loyalty';

            //if (bucket[tabDOM] && bucket[tabDOM].customer != null) {
            //    var loyalty_customer_model = $($(this).parents('.pos_pay_slide').find('.loyalty_pay_model'));
            //    var use_code_btn = $($(loyalty_customer_model).find('.use_pay_code'));
            //
            //    loyalty_customer_model.off();
            //    loyalty_pay_customer.val(bucket[tabDOM].customer);
            //    loyalty_pay_loyalty.val(bucket[tabDOM].loyaltyReference);
            //    loyalty_customer_model.modal('show');
            //    loyalty_customer_model.on('click','.validate_pay_code',function(){
            //        $(loyalty_customer_model).find('.promo_pay_info').hide();
            //        $(loyalty_customer_model).find('.promo_pay_suc').hide();
            //        $(loyalty_customer_model).find('.promo_pay_unsuc').hide();
            //        use_code_btn.val("");
            //        use_code_btn.removeClass('btn-warning');
            //
            //        if(navigator.onLine){
            //            promo_validity($(loyalty_customer_model.find('.loyalty_pay_promo_code')).val(),function(status,results){
            //                if(status){
            //                    var code = $(loyalty_customer_model.find('.loyalty_pay_promo_code')).val();
            //                    use_code_btn.val(code);
            //
            //                    if(results.validity){
            //                        loyalty_gave.attr('disabled',false);
            //                        if(bucket[tabDOM].boucher_code != undefined && bucket[tabDOM].boucher_code != null){
            //                            use_code_btn.addClass('btn-warning');
            //                            use_code_btn.html('un-use code')
            //                        }
            //                        $(loyalty_customer_model).find('.promo_pay_info').show();
            //                        $(loyalty_customer_model).find('.promo_pay_suc').show();
            //                    }
            //                    else if(results.status == 400 && !results.validity){
            //                        loyalty_gave.attr('disabled',true);
            //                        $(loyalty_customer_model).find('.promo_pay_info').show();
            //                        $(loyalty_customer_model).find('.promo_pay_unsuc').show();
            //                    }
            //                    else{
            //                        loyalty_gave.attr('disabled',true);
            //                        bootbox.alert('Can not make loyalty discount now !!');
            //                    }
            //                }
            //                else{
            //                    bootbox.alert('Server error try again later !!');
            //                }
            //            });
            //        }
            //        else{
            //            bootbox.alert('Internet Connection not available now !!!');
            //        }
            //    });
            //
            //    loyalty_customer_model.on('click','.use_pay_code',function(){
            //        var p_code = $(this).val();
            //        loyalty_ref.val(p_code);
            //        if(bucket[tabDOM].boucher_code == undefined || bucket[tabDOM].boucher_code == null ){
            //            bucket[tabDOM].boucher_code = p_code;
            //            use_code_btn.addClass('btn-warning');
            //            use_code_btn.removeClass('btn-primary');
            //            use_code_btn.html('un-use code');
            //            loyalty_gave.attr('disabled',false);
            //        }
            //        else{
            //            bucket[tabDOM].loyalty_ref = null;
            //            bucket[tabDOM].loyalty_amount = 0;
            //            loyalty_amount.html('0');
            //            loyalty_gave.val(0);
            //            loyalty_ref.val('');
            //            loyalty_gave.attr('disabled',true);
            //            bucket[tabDOM].boucher_code = null;
            //            use_code_btn.addClass('btn-primary');
            //            use_code_btn.removeClass('btn-warning');
            //            use_code_btn.html('use code');
            //            loadAmounts();
            //        }
            //    });
            //}
            //else{
            //    bootbox.alert('Customer not found, Please add customer first !!');
            //}

            loyaltyValidation($(this), bucket[tabDOM]);
        });

        /**
         * add text input activation
         */
        paym.on('click', '.tax', function () {
            hidePayType();
            cash.hide();
            removeActiveInput();
            tax_gave.addClass("pay_input");
            tax_pay.show();
            tax_gave.focus();
            pay_mode = 'tax';
        });

        /**
         * add return cash payment input activation
         */

        paym.on('click', '.return_cash_payment', function () {
            hidePayType();
            cash.hide();
            removeActiveInput();
            return_cash_gave.addClass("pay_input");
            return_cash_pay.show();
            var rt = parseFloat(Math.abs(tot.html()));
            bucket[tabDOM].paid_total = ((-1) * rt);
            bucket[tabDOM].recash = ((-1) * rt);
            return_cash_gave.val(rt);
            return_cash_gave.focus();
            pay_mode = 'recash';


        });


        /**
         * add discounts input activation
         */
        paym.on('click', '.discount', function () {
            cash.hide();
            hidePayType();
            removeActiveInput();
            discount_gave.addClass("pay_input");
            discount_pay.show();
            discount_gave.focus();
            pay_mode = 'discount';

        });

        /**
         * hide initial discount and tax when back to pos main page
         */
        function hideExtara() {
            discount_gave.val('');
            discount_amount.html(0);
            credit_input.val('');
            credit_amount.html(0);
            tax_gave.val('');
            tax_amount.html(0);
            return_cash_amount.html(0);
            return_cash_gave.val('');
        }

        /**
         * hiding/refresh pay mode
         */
        function hidePayType() {
            gift.hide();
            loyalty.hide();
            loyalty_pt.hide();
            credit.hide();
            tax_pay.hide();
            return_cash_pay.hide();
            discount_pay.hide();
            verify.removeClass('btn-danger');
            verify.removeClass('btn-success');
            verify.html('Not Verified');
        }

        /**
         * keyboad input 'enter' key listiner
         */
        paym.keypress(function (e) {
            if (e.which == 13) {
                var in_bt = $(paym.find('.invoice_btn'));
                if (in_bt.is(":disabled")) {
                    bootbox.alert({
                        size: "small",
                        title: "Unfinished Payment",
                        message: "Payments not completed yet !!!"
                    });
                }
                else {
                    in_bt.click();
                }
            }
        });

        /**
         * invoice activation event
         */
        paym.on('click', '.invoice_btn', function () {
            console.log("@posPaymentController.js in .invoice_btn");
            $(this).prop('disabled', true);
            var invo_dom = $(paym.parents('.bucket').find('.pos_pay_invoice'));
            var invoice_tax = $(invo_dom.find('.invoice_tax'));
            var invoice_discount = $(invo_dom.find('.invoice_discount'));
            var invoice_discount_type1 = $(invo_dom.find('.invoice_discount_type1'));
            var invoice_tax_type1 = $(invo_dom.find('.invoice_tax_type1'));
            var invoice_return = $(invo_dom.find('.invoice_return'));
            var bill_exp = $(invo_dom.find('.bill_exp'));
            var bill_date = $(invo_dom.find('.bill_date'));
            var bill_time = $(invo_dom.find('.bill_time'));
            var bill_no_2 = $(invo_dom.find('.bill_no_2'));
            var bill_no_1 = $(invo_dom.find('.bill_no_1'));
            var bill_points = $(invo_dom.find('.bill_points'));
            var ret_bill = $(invo_dom.find('.ret_bill'));
            var ref_no = $(invo_dom.find('.ref_no'));
            var cus_name = $(invo_dom.find('.cus_name'));
            var loy_ref = $(invo_dom.find('.loy_ref'));
            //var bill_nop = $(invo_dom.find('.bill_nop'));

            if (bucket[tabDOM]) {
                /**
                 * find no of  product > 10
                 */
                var items = [];
                var msg = "";
                var tit = "";
                function additems(itm) {
                    items.push(itm);
                }
                for (var i = 0; i < bucket[tabDOM].products.length; i++) {
                    if (bucket[tabDOM].products[i]) {
                        if (bucket[tabDOM].products[i].qty >= 10 || bucket[tabDOM].products[i].qty == 0 || bucket[tabDOM].products[i].amount == 0) {
                        var itm = "<tr><td scope='row' style='padding-left: 4%'>"+ bucket[tabDOM].products[i].name  +"</td><td style='text-align: right;padding-right: 6%'>" + bucket[tabDOM].products[i].qty +
                            "</td><td style='text-align: right;padding-right: 5%'>"+ parseFloat(bucket[tabDOM].products[i].amount).toLocaleString('en-US', {minimumFractionDigits:2})+'' + "</td></tr>";
                        additems(itm);
                        }
                    }
                }
                if (items.length > 0) {
                    tit= "Items details with larger qty ,";
                    msg = "<div class='table-responsive-sm'><table class='table table-sm table-hover'>"+"<thead>"+
                       "<tr><th scope='col' class='col-lg-5'>Name </th><th scope='col' class='col-sm-2'>Qty </th><th scope='col'>Price </th>"+"</tr>"+"</thead>"+
                       "<tbody>"+items.join("")+"</tbody>"+
                       "</table></div>"+"<hr style='background-color: rgba(2,7,255,0.04);margin: 2%'>"
                }
            }

            var products = [];
            if (bucket[tabDOM]) {
                products = bucket[tabDOM].products;
                returned_products = bucket[tabDOM].return_products;
            }

            var invoiceTable_body = $(invoiceDom.find('.invoice_table').find('tbody'));
            var total = 0;
            invoiceTable_body.html('');

            /**
             * add products to bill
             */
            products.forEach(function (val) {
                var price = parseFloat(((val.qty * val.cost) - (val.qty * val.cost * (val.dis / 100)) + (val.qty * val.cost * (val.tax / 100))) + '');
                total += parseFloat(price);
                var tr_row = '<tr style="border-bottom: dotted 1px; font-size: 90%;">' +
                    '<td width="55%" >' + val.name + ' ' + val.qty + ' x ' + val.cost + ' ';
                tr_row += (val.dis > 0) ? '<br/>' + val.dis + '% discount' : '';
                tr_row += (val.tax > 0) ? ' ' + val.tax + '% tax' : '';
                tr_row += '</td>' + '<td width="13%" style="text-align: right;"> ' + val.qty + '</td>' + '</td>' + '<td style="text-align: right;"> ' + price.toLocaleString('en-US', {minimumFractionDigits:2}) + '</td>' +
                    '</tr>';
                invoiceTable_body.append(tr_row);

            });
            console.log(total);
            // added
            id_check = 0;
            returned_products.forEach(function (val) {
                var price = parseFloat(((val.qty * val.cost) - (val.qty * val.cost * (val.dis / 100)) + (val.qty * val.cost * (val.tax / 100))) + '');
                // total += price;
                var tr_row = '<tr style="border-bottom: dotted 1px ;font-size: 90%; align-content:end">' +
                    '<td width="55%">' + val.name + ' ' + val.qty + ' x ' + val.cost + ' ';
                tr_row += (val.dis > 0) ? '<br/>' + val.dis + '% discount' : '';
                tr_row += (val.tax > 0) ? ' ' + val.tax + '% tax' : '';
                tr_row += '</td>' + '<td width="13%" style="text-align: right;"> ' + -1 * val.qty + '</td>' + '</td>' + '<td style="text-align: right;"> ' + price.toLocaleString('en-US', {minimumFractionDigits:2})+ '</td>' +
                    '</tr>';
                invoiceTable_body.append(tr_row);
            });
            // end

            if (bucket[tabDOM]) {

                cus_name.text(bucket[tabDOM].customer);
                loy_ref.text(bucket[tabDOM].loyaltyReference);
                //$(invoiceDom.find('.bill_total')).text(pay_total_ammount + return_total);
                $(invoiceDom.find('.bill_total')).text(pay_total_ammount.toLocaleString('en-US', {minimumFractionDigits:2}));
                $(invoiceDom.find('.bill_sales')).text(total.toLocaleString('en-US', {minimumFractionDigits:2}));


                if (bucket[tabDOM].return_flag || bucket[tabDOM].returen_total > 0) {

                    invoice_return.parent().show();
                    var ttl = parseFloat(bucket[tabDOM].returen_total);
                    invoice_return.text(ttl.toLocaleString('en-US', {minimumFractionDigits:2}));
                    ret_bill.parent().show();
                    ret_bill.text(bucket[tabDOM].bill_id);
                    bucket[tabDOM].return_flag  =  true;
                }

                $(invoiceDom.find('.bill_paid_cash_repayment')).text(bucket[tabDOM].recash.toLocaleString('en-US', {minimumFractionDigits:2}));
                $(invoiceDom.find('.bill_paid_cash')).text(bucket[tabDOM].cash.toLocaleString('en-US', {minimumFractionDigits:2}));
                $(invoiceDom.find('.bill_nop')).text(nop);
                $(invoiceDom.find('.bill_paid_credit')).text(bucket[tabDOM].credit.toLocaleString('en-US', {minimumFractionDigits:2}));
                $(invoiceDom.find('.bill_paid_gift')).text(bucket[tabDOM].gift.toLocaleString('en-US', {minimumFractionDigits:2}));
                var loyalty = bucket[tabDOM].total * bucket[tabDOM].loyalty / 100 + ((bucket[tabDOM].loyalty_pt) ? bucket[tabDOM].loyalty_pt : 0);
                $(invoiceDom.find('.bill_paid_loyalty')).text(loyalty.toLocaleString('en-US', {minimumFractionDigits:2}));
                //$(invoiceDom.find('.bill_paid_loyalty_pt')).text(bucket[tabDOM].loyalty_pt);
                var in_bal = (parseFloat(((bucket[tabDOM].cash + bucket[tabDOM].credit + bucket[tabDOM].gift + loyalty) - bucket[tabDOM].paid_total) + '').toFixed(2)) ?
                    parseFloat((((bucket[tabDOM].cash + bucket[tabDOM].credit + bucket[tabDOM].gift + loyalty ) - bucket[tabDOM].paid_total)).toFixed(2)+ '') : 0;
                $(invoiceDom.find('.bill_balance')).text(in_bal.toLocaleString('en-US', {minimumFractionDigits:2}));

            }

            if (!bucket[tabDOM]['is_generated']) {
                if (navigator.onLine) {

                    /**
                     * db payment submission
                     */
                    invoice.prop('disabled', true);
                    console.log(bucket[tabDOM]);
                    bootbox.confirm({
                        title: tit,
                        message: msg +
                            "<label style='font-size: 18px'>"+"Confirm Bill ?"+"</label>",
                        buttons: {
                            cancel: {
                                label: '<i class="fa fa-times"></i> Cancel'
                            },
                            confirm: {
                                label: '<i class="fa fa-check"></i> Confirm'
                            }
                        },
                        callback: function (confirm) {
                            if (confirm) {
                                bucket[tabDOM]['is_generated'] = true;
                                console.log(bucket[tabDOM]);
                                try {
                                    $.ajax({
                                        type: 'POST',
                                        url: bill_url,
                                        data: {
                                            bill: JSON.stringify(bucket[tabDOM]),
                                            cashier: cashier,
                                            branch: branch,
                                            sessionId: sessionId
                                        },
                                        success: function (results) {
                                            if (results.status == 200) {

                                                loadBillPara(results);
                                                syncOfflineBills(function (status) {});
                                                //sendEmails(bucket[tabDOM].email, $(invoiceDom.find('.email_invoice')).html());
                                                //paym.hide();
                                                //bill_no_2.text(results.billNo);
                                                //bill_no_1.text(results.billNo);
                                                //bill_date.text((new Date(results.date)).toDateString());
                                                //bill_exp.text((new Date(results.expiry)).toDateString());
                                                //var in_tax = (bucket[tabDOM].tax) ? bucket[tabDOM].tax : 0;
                                                //invoice_tax.text(in_tax);
                                                //var in_dis = (bucket[tabDOM].discount) ? bucket[tabDOM].discount + ' ' + bucket[tabDOM].discount_type : 0;
                                                //invoice_discount.text(in_dis);
                                                //invoiceDom.show();
                                                //$(invoiceDom.find('.bill_print')).click();
                                            }
                                            else {
                                                bootbox.alert({
                                                    size: "small",
                                                    title: "Server Error",
                                                    message: "'Bill submission error !! Contact system admin'"
                                                });
                                                invoice.prop('disabled', false);
                                            }
                                        }
                                    });
                                }
                                catch (e) {
                                    bootbox.alert({
                                        size: "small",
                                        title: "Server Error !",
                                        message: "'Bill submission error !! Contact system admin'"
                                    });
                                    invoice.prop('disabled', false);
                                }

                            }
                            else {
                                invoiceDom.off();
                                invoice.prop('disabled', false);
                                bac();
                            }

                        }
                    });

                }
                else {
                    invoice.prop('disabled', true);
                    bootbox.confirm({
                        title: tit,
                        message: msg +
                            "<label style='font-size: 18px'>"+"Internet connection error!! But offline bill submission available. Confirm Bill ?"+"</label>",
                        buttons: {
                            cancel: {
                                label: '<i class="fa fa-times"></i> Cancel'
                            },
                            confirm: {
                                label: '<i class="fa fa-check"></i> Confirm'
                            }
                        },
                        callback: function (confirm) {
                            if (confirm) {
                                bucket[tabDOM]['is_generated'] = true;
                                console.log(bucket[tabDOM]);
                                var offlinePayments = localStorage.getItem('off_payments');

                                if (!offlinePayments) {
                                    offlinePayments = {};
                                }
                                else {
                                    offlinePayments = JSON.parse(offlinePayments);
                                    console.log(offlinePayments);
                                }
                                var cust_id = (bucket[tabDOM].customer_id && bucket[tabDOM].customer_id != null) ? parseInt(bucket[tabDOM].customer_id) : 0;
                                var billNo = branch + '/' + cust_id + '/' + Math.round(new Date() / 1000) + '/o';
                                var date1 = new Date();
                                var date = new Date();
                                var payment_off = {
                                    bill: JSON.stringify(bucket[tabDOM]),
                                    cashier: cashier,
                                    billNo: billNo,
                                    branch: branch,
                                    sessionId: sessionId,
                                    date: date1,
                                    expiry: new Date(date.setDate(date.getDate() + 7))
                                };
                                //offlinePayments.push(payment_off);
                                offlinePayments[billNo] = payment_off;
                                localStorage.setItem('off_payments', JSON.stringify(offlinePayments));
                                loadBillPara({
                                    billNo: payment_off.billNo,
                                    date: payment_off.date,
                                    expiry: payment_off.expiry
                                });

                                invoice.prop('disabled', false);
                            }
                            else {
                                invoiceDom.off();
                                invoice.prop('disabled', false);
                            }
                        }
                    });
                }
            }

            function loadBillPara(results) {
                paym.hide();
                bill_no_2.text(results.billNo);
                bill_no_1.text(results.billNo);
                var points = (bucket[tabDOM].loyaltyReference != undefined && bucket[tabDOM].loyaltyReference != '') ? (bucket[tabDOM].cash + bucket[tabDOM].credit) : 0;
                bill_points.text(points / 1000);
                var bill_daa = new Date();
                bill_date.text(bill_daa.getDate() + '/' + (bill_daa.getMonth() + 1) + '/' + bill_daa.getFullYear());
                bill_time.text(bill_daa.toLocaleTimeString());
                var exp_da = new Date(results.expiry);
                bill_exp.text(exp_da.getDate() + '/' + (exp_da.getMonth() + 1) + '/' + exp_da.getFullYear());
                // var in_tax = (bucket[tabDOM].tax) ? (bucket[tabDOM].tax*total/100) : 0;
                if (bucket[tabDOM].tax != 0){
                    invoice_tax_type1.text(' ('+bucket[tabDOM].tax+'%)');
                }
                invoice_tax.text(tax_amount12.toLocaleString('en-US', {minimumFractionDigits:2}));
                if (bucket[tabDOM].discount_type == '%') {
                    var in_dis = (bucket[tabDOM].discount) ? bucket[tabDOM].discount + ' ' + bucket[tabDOM].discount_type: 0;
                    // var dis = ((bucket[tabDOM].discount * total)/100);
                    invoice_discount_type1.text( ' ('+in_dis+')');
                    invoice_discount.text(dis_amount12.toLocaleString('en-US', {minimumFractionDigits:2}));
                }else {
                    var in_dis1 = (bucket[tabDOM].discount) ? bucket[tabDOM].discount : 0;
                    invoice_discount.text(in_dis1.toFixed(2));
                };
                invoiceDom.show();
                $(invoiceDom.find('.bill_print')).click();
            }

            /**
             * bill print event
             */
            invoiceDom.on('click', '.bill_print', function () {
                $($(document).find('.bucket.tab-pane.active').find('.power_link')).show();
                var invoice_print = $(invoiceDom.find('.invoice_print'));
                var newWin = window.open();

                newWin.document.write('<html><body style="width:72mm">' +
                    '' + invoice_print.html() +
                    '</body></html>');
                newWin.document.close();
                newWin.focus();
                newWin.print();

                setTimeout(function () {
                    newWin.close();
                }, 10000);
                $($(document).find('.bucket.tab-pane.active').find('.power_link')).hide();
            });

            /**
             * bill close and current tab close event
             */
            invoiceDom.on('click', '.bill_close', function () {
                var tabDOM = $($(this).parents('.bucket').first()).attr('id');
                var id = $($(document).find('#extend').find('a[href="#' + tabDOM + '"]').find('.tab_remove'));
                id.click();
            });

        });
    });

    // function sendEmails(email, content) {
    //     var offlineEmails = localStorage.getItem('off_mails');

    //     if (!offlineEmails) {
    //         offlineEmails = {};
    //     }
    //     else {
    //         offlineEmails = JSON.parse(offlineEmails);
    //         console.log(offlineEmails);
    //     }

    //     if (navigator.onLine) {
    //         emailBill(email, content);
    //         offlineEmailBill(offlineEmails, function (ids) {
    //             console.log(offlineEmails);
    //             console.log(ids);
    //             for (var i = 0; i < ids.length; i++) {
    //                 var id = ids[i];
    //                 console.log(offlineEmails[id + '']);
    //                 delete offlineEmails[id + ''];
    //             }
    //             console.log(offlineEmails);
    //             localStorage.setItem('off_mails', JSON.stringify(offlineEmails));
    //         });
    //     }
    //     else {
    //         var mail_date = new Date();
    //         offlineEmails[mail_date.getTime() + ''] = {email: email, content: content};
    //     }
    //     localStorage.setItem('off_mails', JSON.stringify(offlineEmails));
    // }
    function syncOfflineBills(callback) {
        var offlinePayments = localStorage.getItem('off_payments');
        console.log('offline bills');
        if (offlinePayments) {
            offlinePayments = JSON.parse(offlinePayments);
            if (Object.keys(offlinePayments).length > 0) {
                console.log('offline sents');
                $.ajax({
                    type: 'POST',
                    url: bill_url + '/offline',
                    data: {
                        bill: JSON.stringify(offlinePayments),
                        cashier: cashier,
                        branch: branch,
                        sessionId: sessionId
                    },
                    success: function (results) {
                        if (results.status == 200) {
                            console.log(results);
                            console.log(offlinePayments);
                            for (var k = 0; k < results.submitted.length; k++) {
                                console.log(offlinePayments[results.submitted[k]]);
                                delete offlinePayments[results.submitted[k]];
                            }
                            console.log(offlinePayments);
                            localStorage.setItem('off_payments', JSON.stringify(offlinePayments));
                            callback(true);
                        }
                        else {
                            bootbox.alert({
                                size: "small",
                                title: "Server Error",
                                message: "'Bill submission error !! Contact system admin'"
                            });
                            callback(false);
                        }
                    }
                });
            } else {
                callback(true);
            }
        }
        else {
            callback(true);
        }

    }
    /**
     * end session
     * */
    $('.end_session').click(function (e) {

        e.preventDefault();
        bootbox.confirm('Do you want to end this ?', function (confirm) {
            if (confirm) {
                if (navigator.onLine) {
                    syncOfflineBills(function (status) {
                        console.log(status);
                        if (status) {
                            $.ajax({

                                type: 'POST',
                                url: session_url + '/endSession',
                                data: {session: sessionId, cashier: parseInt(cashier)},
                                success: function (results) {

                                    if (results && results.status == 200) {
                                        console.log(results);
                                        window.location = end_session_url;
                                    }
                                    else {
                                        bootbox.alert({
                                            size: "small",
                                            title: "Connection Error",
                                            message: "'Internet connection not available !!! You can not end this session'"
                                        });
                                    }
                                },
                                complete: function (dat) {
                                }
                            });
                        }
                        else {
                            bootbox.alert({
                                size: "small",
                                title: "Connection Error",
                                message: "'Internet connection not available !!! You can not end this session'"
                            });
                        }
                    });
                }
                else {
                    bootbox.alert({
                        size: "small",
                        title: "Connection Error",
                        message: "'Internet connection not available !!! You can not end this session'"
                    });
                }
            }
        });
        // .toLocaleString('en-US', {minimumFractionDigits:2})
    });
});