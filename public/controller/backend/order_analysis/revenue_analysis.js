$(document).ready(function () {

    let tag = true;
    let revenue_reports = {};
    let pie_re_data = {};
    let pie_grf_data = {};
    let fileName=''

    $(document).on('click', '.all_products_fill', function () {

        $(this).removeClass('fa-minus-square');
        $(this).removeClass('fa-plus-square');
        let data = $(this).data('cat');
        let data_arr = data.split("|");
        let cls = '.cat-' + data_arr[0];
        let row = $($(document).find('#table').find('tbody').find(cls));

        if (parseInt(data_arr[1]) == 1) {
            $(this).addClass('fa-plus-square');
            $(this).data('cat', '' + data_arr[0] + "|0");
            (row) ? row.hide() : 0;
        }
        else {
            $(this).addClass('fa-minus-square');
            $(this).data('cat', data_arr[0] + "|1");
            (row) ? row.show() : 0;
        }
    });

    $(document).on('click', '.all_products', function () {
        $(this).removeClass('fa-minus-square');
        $(this).removeClass('fa-plus-square');

        let data = $(this).data('cash');
        let data_arr = data.split("|");
        ////console.log(data_arr);
        let cls = '.all_view-' + data_arr[0];
        let row = $($(document).find('#table').find('tbody').find(cls));

        ////console.log($(this).parent());
        let da = data_arr[2] + '|' + data_arr[3] + '|' + data_arr[4];

        if (parseInt(data_arr[1]) == 1) {
            $(this).addClass('fa-plus-square');
            $(this).data('cash', '' + data_arr[0] + "|0|" + da);
            $('.br' + data_arr[4]).attr('rowspan', parseInt(data_arr[2]));
            (row) ? row.hide() : 0;
        }
        else {
            $(this).addClass('fa-minus-square');
            $(this).data('cash', data_arr[0] + "|1|" + da);
            $('.br' + data_arr[4]).attr('rowspan', parseInt(data_arr[2]) * parseInt(data_arr[3]));
            (row) ? row.show() : 0;
        }
    });

    $('.table_view').click(function () {
        removeActives()
        $('.product_table').show();
        $('.bar_chart').hide();
        $('.pie_chart').hide();
        $(this).addClass('active');
    });

    $(".custom_filter").click(function (event) {
        $(".fa-spinner").show()
        $('.product_table').show();
        $('.bar_chart').show();
        $('.pie_chart').show();
        event.preventDefault();
        let formData = $('.form_filter').serializeArray();
        let cashiers = groupFormInputs(formData)['casheirs[]'];
        let branches = groupFormInputs(formData)['branches[]'];
        (!cashiers) ? cashiers = ['0'] : 0;
        (!branches) ? branches = ['0'] : 0;
        ////console.log(cashiers);

        let data = {
            from: $("#from").val(),
            end: $("#end").val(),
            branch: $("#branch").val(),
            period: $("#period").val(),
            cashiers: JSON.stringify(cashiers),
            branches: JSON.stringify(branches)
        };
        ////console.log(data);
        if (data.from && data.from != null && data.from != '') {
            ////console.log(formData);
            $.ajax({
                type: 'POST',
                url: filter_url,
                data: data,
                success: function (data) {
                    ////console.log(data);
                    //drawTable(data);
                    drawTable2(data);
                    $('.download').attr('disabled', false);
                    $('.bar_chart_view').attr('disabled', false);
                    $('.pie_chart_view').attr('disabled', false);
                    $(".fa-spinner").hide()
                }
            });
        }
        else {
            bootbox.alert('check date filter inputs !!');
        }
    });


    function drawTable2(data) {
        ////console.log(data);
        revenue_reports.data = JSON.stringify(data);
        revenue_reports.brancheLists = JSON.stringify(brancheLists);
        revenue_reports.cashiersLists = JSON.stringify(cashiersLists);

        let reports = data.re_report;
        let branch_keys = Object.keys(reports);
        let columns = data.columns;
        ////console.log(columns);
        ////console.log(reports);


        let dates = data.dates;

        let table_dom = $($('#table thead'));
        let table_body = $($('#table tbody'));

        $(table_dom).html(' ');
        $(table_body).html(' ');
        let head1 = '<tr><th>Branches</th><th>Cashiers</th><th>Payment Method</th>';

        for (let i = 0; i < dates.length; i++) {
            let n_date = new Date(dates[i]);
            let per = $("#period").val();
            if (per == "DAY") {
                n_date = dates[i];
            }
            else if (per == "MONTH") {
                n_date = (n_date.getMonth() + 1) + '/' + n_date.getFullYear();
            }
            else if (per == "YEAR") {
                n_date = n_date.getFullYear();
            }
            head1 += '<th style="text-align: center;white-space: nowrap">' + n_date + '</th>';
        }
        head1 += '</tr>';
        $(table_dom).html(head1);

        pie_grf_data = {};

        for (let i = 0; i < branch_keys.length; i++) {
            let branch = reports[branch_keys[i]];
            let cashiers = Object.keys(branch);
            pie_grf_data[branch_keys[i]] = branch.payments;
            ////console.log(cashiers);
            ////console.log(columns);
            let p_row = '<tr style="border-top: solid"><td class="br' + i + '" rowspan="' + (columns.length) + '">' + brancheLists[branch_keys[i]] + '</td>';
            let r_flag = true;
            ////console.log("------------------------------------------------------------------------------------------------------------------------------");
            let d_flag = false;
            for (let j = 0; j < cashiers.length; j++) {
                let cashier_name = (cashiers[j] == 'payments') ? '<b><span data-cash="' + branch_keys[i] + '|0|' + columns.length + '|' + cashiers.length + '|' + i + '" class="fa fa-plus-square all_products"></span> Total</b>' : cashiers[j];
                let row = '';
                if (r_flag) {
                    row = p_row + '<td rowspan="' + columns.length + '">' + cashier_name + '</td>';
                    d_flag = true;
                    r_flag = false;
                }
                else {
                    d_flag = false;
                    row = '<tr class="all_view-' + branch_keys[i] + '" style="border-top: solid gray;display: none"><td rowspan="' + columns.length + '">' + cashier_name + '</td>';
                }

                ////console.log(cashier_name);
                ////console.log(d_flag);
                ////console.log(row);
                ////console.log("***************************************************************************************");
                let re_flag = true;
                for (let k = 0; k < columns.length; k++) {
                    ////console.log("//////////////////////////////////////////");
                    let re_row = '';
                    if (re_flag) {
                        re_row += row;
                        re_flag = false;

                    }
                    else {
                        re_row += '<tr ';
                        if (!d_flag) {
                            re_row += ' style="display:none" ';
                            re_row += ' class="all_view-' + branch_keys[i] + '"';
                        }
                        re_row += '>';
                    }
                    re_row += '<td style="text-transform: capitalize">' + columns[k] + '</td>';
                    ////console.log(re_row);
                    for (let l = 0; l < dates.length; l++) {

                        if (branch[cashiers[j]][dates[l]]) {
                            let payments = (cashiers[j] == 'payments') ? branch[cashiers[j]][dates[l]] : branch[cashiers[j]][dates[l]].payments;
                            let valu = (columns[k] == 'bills') ? Object.keys(payments[columns[k]]).length : payments[columns[k]];
                            re_row += '<td style="text-align: right">' + valu + '</td>';
                        }
                        else {
                            re_row += '<td style="text-align: right">0</td>';
                        }
                    }
                    $(table_body).append(re_row + '</tr>');
                }
            }


        }

        loadGraphs(pie_grf_data, dates);
        refreshOptions(pie_grf_data, dates);
        $('.pie_chart').hide();
    }

//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////
    /**
     * DON'T DELETE THIS
     */
    //function drawTable(data){
    //    //console.log(data);
    //    revenue_reports.data = JSON.stringify(data);
    //    revenue_reports.brancheLists = JSON.stringify(brancheLists);
    //    revenue_reports.cashiersLists = JSON.stringify(cashiersLists);
    //
    //    var reports = data.report;
    //    var body = data.body;
    //    var cashiers  = JSON.parse(body.cashiers);
    //    var branches  = JSON.parse(body.branches);
    //    var branch_keys = branches;
    //    var cols  = data.cols;
    //    var columns  = data.columns;
    //
    //    if(cashiers.indexOf('0')>=0){
    //        cashiers = cashiersLists.filter(function(x){
    //            return cashiersLists.indexOf(x);
    //        })
    //    }
    //    if(branches.indexOf("0")>=0){
    //        branches = brancheLists.map(function(x){
    //            return brancheLists.indexOf(x);
    //        });
    //        branch_keys = Object.keys(branches);
    //    }
    //
    //    var table_dom = $($('#table thead'));
    //    var table_body = $($('#table tbody'));
    //
    //    $(table_dom).html(' ');
    //    $(table_body).html(' ');
    //    var head1 = '<tr><th></th>';
    //    var head2 = '<tr><th>Date</th>';
    //
    //    for(var i = 0; i<branch_keys.length;i++){
    //        head1 += '<th colspan="'+parseInt(cols)+'">'+brancheLists[branch_keys[i]]+'</th>';
    //        for(var j = 0; j<columns.length;j++){
    //            head2 += ' <th style="text-transform: capitalize">'+columns[j]+'</th>';
    //        }
    //    }
    //    head1 += '</tr>';
    //    head2 += '</tr>';
    //    $(table_dom).html(head1);
    //    $(table_dom).append(head2);
    //
    //
    //    var t_rows = '';
    //    var dates = Object.keys(reports);
    //    var l = dates.length- 1;
    //
    //    for(var i = 0; i < dates.length;i++){
    //        var report = reports[dates[i]];
    //
    //        //var p_row = '<tr><th style="text-align: left;white-space: nowrap"><span data-cash="" class="fa fa-plus-square all_products">'+
    //        var p_row = '<tr><td style="text-align: left;white-space: nowrap">'+
    //            '</span> '+ dates[i] +'</td>';
    //        for(var k = 0; k<branch_keys.length;k++){
    //            var branch_id = branch_keys[k];
    //            if(report[branch_id]){
    //                for(var j = 0; j<columns.length;j++){
    //                    p_row += '<td style="text-align: right">'+report[branch_id].payments[columns[j]]+'</td>';
    //                }
    //            }
    //            else{
    //                p_row += '<td colspan="'+parseInt(cols)+'" style="text-align: right">0</td>';
    //            }
    //        }
    //        p_row += '</tr>';
    //        t_rows += p_row;
    //
    //    }
    //    $(table_body).append(t_rows);
    //    pie_re_data = {
    //        data : data,
    //        branch_keys : branch_keys,
    //        dates : dates
    //    };
    //    loadGraphs(data,branch_keys,dates);
    //    refreshOptions(data,branch_keys,dates);
    //    $('.pie_chart').hide();
    //}

///////////////////////////////// DON'T DELETE //////////////////////////////////////////////////

       $('.download').click(function(){
    /* $('.custom_filter').click();
     ////console.log(revenue_reports);
     $.ajax({
     type: 'POST',
     url: filter_url+'/report',
     data: revenue_reports,
     success: function (data) {
     if(data.status == 200){
     $('#file_name').val(data.link);
     $('#revenue_download').click();
     }
     },
     failed : function(){
     bootbox.alert('download failed !!');
     }
     });
     });*/
     console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR")
     $(".download_loader").show()
     exportTableToExcel("table",fileName)
     });
     function exportTableToExcel(tableID, filename = ''){
        let downloadLink;
        let dataType = 'application/vnd.ms-excel';
        let tableSelect = document.getElementById(tableID);
        let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename?filename+'.xls':'excel_data.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if(navigator.msSaveOrOpenBlob){
            let blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
            $(".download_loader").hide()
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
            $(".download_loader").hide()
        }
    }


    /* $('.download').click(function () {

        $('.product_table').show();
        $('.bar_chart').show();
        $('.pie_chart').show();
        event.preventDefault();
        let formData = $('.form_filter').serializeArray();
        let cashiers = groupFormInputs(formData)['casheirs[]'];
        let branches = groupFormInputs(formData)['branches[]'];
        (!cashiers) ? cashiers = ['0'] : 0;
        (!branches) ? branches = ['0'] : 0;
        ////console.log(cashiers);

        let data = {
            from: $("#from").val(),
            end: $("#end").val(),
            branch: $("#branch").val(),
            period: $("#period").val(),
            cashiers: JSON.stringify(cashiers),
            branches: JSON.stringify(branches),
            branch_list: JSON.stringify(brancheLists),
            cashier_list :  JSON.stringify(cashiersLists)
        };
        ////console.log(data);
        if (data.from && data.from != null && data.from != '') {
            ////console.log(formData);
            $.ajax({
                type: 'POST',
                url: filter_url + '/report',
                data: data,
                success: function (data) {
                    if (data.status == 200) {
                        //console.log('successfull');
                        $('#file_name').val(data.link);
                        $('#revenue_download').click();
                    }
                }
            });
        }
        else {
            bootbox.alert('check date filter inputs !!');
        }
    });

*/
    /**
     * group form inputs
     * @param formData
     * @returns {{}}
     */
    function groupFormInputs(formData) {
        let formDataGrouped = {};
        formData.forEach(function (entry) {
            if (typeof formDataGrouped[entry.name] == 'undefined') {
                formDataGrouped[entry.name] = [];
            }
            formDataGrouped[entry.name].push(entry.value);
        });

        return formDataGrouped;
    }

//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////
    /**
     * DON'T DELETE THIS
     */

    ///**
    // * graph load section
    // * loading bar chart
    // * @param details
    // */
    //function loadGraphs(data,branch_keys,dates) {
    //    ////console.log(data);
    //    ////console.log(branch_keys);
    //    ////console.log(dates);
    //    var barData = [];
    //    var labels = [];
    //    var barObj = {h: ''};
    //    for(var j = 0; j< branch_keys.length; j++){
    //        labels.push(brancheLists[branch_keys[j]]);
    //        barObj[branch_keys[j] + ''] = 0;
    //    }
    //    ////console.log(barObj);
    //
    //    for (var i = 0; i < dates.length; i++) {
    //        var newObj = JSON.parse(JSON.stringify(barObj));
    //        newObj = {h: '' + dates[i]};
    //        ////console.log(newObj);
    //        for(var k = 0; k< branch_keys.length ; k++){
    //            if(data.report[dates[i]][branch_keys[k]]){
    //                var payments = data.report[dates[i]][branch_keys[k]].payments;
    //                newObj[branch_keys[k]+''] = payments.total;
    //            }
    //            else{
    //                newObj[branch_keys[k]+''] = 0;
    //            }
    //        }
    //        barData.push(newObj);
    //    }
    //    //$('#bar-chart').empty();
    //    //
    //    ////console.log(barData)
    //    var bar = new Morris.Bar({
    //        element: 'bar-chart',
    //        resize: true,
    //        data: barData,
    //        barColors: ['#00a65a', '#f56954', '#6bb2f5','#f56954', '#6bb2f5'],
    //        xkey: 'h',
    //        ykeys: branch_keys,
    //        labels: labels,
    //        hideHover: 'auto'
    //    });
    //    $('.bar_chart').hide();
    //}

    /**
     * graph load section
     * loading bar chart
     * @param details
     */
    function loadGraphs(pie_gr_date, dates) {
        ////console.log(pie_gr_date);
        let barData = [];
        let labels = [];
        let barObj = {h: ''};

        let branch_keys = Object.keys(pie_gr_date);
        for (let j = 0; j < branch_keys.length; j++) {
            labels.push(brancheLists[branch_keys[j]]);
            barObj[branch_keys[j] + ''] = 0;
        }
        ////console.log(barObj);

        for (let i = 0; i < dates.length; i++) {
            let newObj = JSON.parse(JSON.stringify(barObj));
            newObj = {h: '' + dates[i]};
            ////console.log(newObj);
            for (let k = 0; k < branch_keys.length; k++) {
                if (pie_gr_date[branch_keys[k]][dates[i]]) {
                    let payments = pie_gr_date[branch_keys[k]][dates[i]];
                    newObj[branch_keys[k] + ''] = payments.total;
                }
                else {
                    newObj[branch_keys[k] + ''] = 0;
                }
            }
            barData.push(newObj);
        }
        //$('#bar-chart').empty();
        //
        ////console.log(barData)
        let bar = new Morris.Bar({
            element: 'bar-chart',
            resize: true,
            data: barData,
            barColors: ['#00a65a', '#f56954', '#6bb2f5', '#f56954', '#6bb2f5'],
            xkey: 'h',
            ykeys: branch_keys,
            labels: labels,
            hideHover: 'auto'
        });
        $('.bar_chart').hide();
    }

//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////

    $('.bar_chart_view').click(function () {
        removeActives()
        $('.product_table').hide();
        $('.bar_chart').show();
        $('.pie_chart').hide();
        $(this).addClass('active');
    });

    $('.pie_chart_view').click(function () {
        removeActives()
        $('.product_table').hide();
        $('.bar_chart').hide();
        $('.pie_chart').show();
        $(this).addClass('active');
    });

    $('.refresh').click(function () {
        removeActives()
        $('.bar_chart').show();
        $('.product_table').show();
        $(".custom_filter").click();
        $('.pie_chart').show();
        $('.table_view').addClass('active');
    });

    function removeActives() {
        $('.pie_chart_view').removeClass('active');
        $('.bar_chart_view').removeClass('active');
        $('.table_view').removeClass('active');
    }

//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////
    /**
     * DON'T DELETE THIS
     */
    //function refreshOptions(data,branch_keys,dates){
    //    var dateOptions = '';
    //    var branchOptions = '';
    //    for (var i = 0; i < dates.length; i++) {
    //        dateOptions += '<option value="' + dates[i] + '">' + dates[i] + '</option>';
    //    }
    //    $('select#pie_date').html(dateOptions);
    //
    //    for(var j = 0; j< branch_keys.length; j++){
    //        branchOptions += '<option value="' + branch_keys[j] + '">' + brancheLists[branch_keys[j]] + '</option>';
    //    }
    //    $('select#pie_branch').html(branchOptions);
    //
    //    loadChart();
    //}

    function refreshOptions(data, dates) {
        let dateOptions = '';
        let branchOptions = '';
        for (let i = 0; i < dates.length; i++) {
            let n_date = new Date(dates[i]);
            let per = $("#period").val();
            if (per == "DAY") {
                n_date = dates[i];
            }
            else if (per == "MONTH") {
                n_date = (n_date.getMonth() + 1) + '/' + n_date.getFullYear();
            }
            else if (per == "YEAR") {
                n_date = n_date.getFullYear();
            }
            dateOptions += '<option value="' + dates[i] + '">' + n_date + '</option>';
        }
        $('select#pie_date').html(dateOptions);

        let branch_keys = Object.keys(data);

        for (let j = 0; j < branch_keys.length; j++) {
            branchOptions += '<option value="' + branch_keys[j] + '">' + brancheLists[branch_keys[j]] + '</option>';
        }
        $('select#pie_branch').html(branchOptions);

        loadChart();
    }

//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////


//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////
    /**
     * DON'T DELETE THIS
     */
    //function loadChart() {
    //    var date = $('.pie_date').val();
    //    var branch = $('.pie_branch').val();
    //    var pie_data = [{label:'no transaction',value:0}];
    //    if(pie_re_data.dates.length > 0 && pie_re_data.data.report[date] && pie_re_data.data.report[date] != null){
    //        var report = pie_re_data.data.report[date];
    //        if(report[branch]){
    //            var payments = report[branch].payments;
    //            pie_data = [];
    //            var payments_keys = Object.keys(payments);
    //            ////console.log(payments);
    //            for(var k = 0; k<payments_keys.length;k++){
    //                if(payments_keys[k] != 'bills' && payments_keys[k] != 'total'){
    //                    pie_data.push({
    //                        label : payments_keys[k],
    //                        value : parseFloat(payments[payments_keys[k]])
    //                    });
    //                }
    //            }
    //            ////console.log(pie_data);
    //        }
    //    }
    //
    //    $('#chart-detail').html('');
    //    if(pie_data.length > 0){
    //        $('.chart').show();
    //        $('.graph-error').hide();
    //        var donut = new Morris.Donut({
    //            element: 'chart-detail',
    //            resize: true,
    //            colors: ['#f56954', '#00a65a', '#4090a6', '#5338a6', '#d5af13', '#a6a0a0', '#64a6a1', '#00a65a', '#4090a6'],
    //            data: pie_data,
    //            hideHover: 'auto'
    //        });
    //    }
    //    else{
    //        $('.chart').hide();
    //        $('.graph-error').show();
    //    }
    //
    //}


    function loadChart() {
        let date = $('.pie_date').val();
        let branch = $('.pie_branch').val();
        let pie_data = [{label: 'no transaction', value: 0}];
        if (Object.keys(pie_grf_data).length > 0 && pie_grf_data[branch] && pie_grf_data[branch][date] != null) {
            let report = pie_grf_data[branch][date];
            pie_data = [];
            let payments_keys = Object.keys(report);
            for (let k = 0; k < payments_keys.length; k++) {
                if (payments_keys[k] != 'bills' && payments_keys[k] != 'total') {
                    pie_data.push({
                        label: payments_keys[k],
                        value: parseFloat(report[payments_keys[k]])
                    });
                }
            }
        }

        $('#chart-detail').html('');
        if (pie_data.length > 0) {
            $('.chart').show();
            $('.graph-error').hide();
            let donut = new Morris.Donut({
                element: 'chart-detail',
                resize: true,
                colors: ['#f56954', '#00a65a', '#4090a6', '#5338a6', '#d5af13', '#a6a0a0', '#64a6a1', '#00a65a', '#4090a6'],
                data: pie_data,
                hideHover: 'auto'
            });
        }
        else {
            $('.chart').hide();
            $('.graph-error').show();
        }

    }

//////////////////////////////////DON'T DELETE THIS///////////////////////////////////////////////

    $('.pie_data').change(function () {
        loadChart();
    });


});