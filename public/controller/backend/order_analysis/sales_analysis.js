$(document).ready(function () {

    let tag = true;
    let sales_reports = {};
    let reports = {};
    let re_dates = [];
    let re_data = [];
    let fileName=''
    $('.download').disabled = true

    $(document).on('click','.all_products_fill',function(){

        $(this).removeClass('fa-minus-square');
        $(this).removeClass('fa-plus-square');
        let data = $(this).data('cat');
        let data_arr = data.split("|");
        let cls = '.cat-'+data_arr[0];
        let row = $($(document).find('#table').find('tbody').find(cls));

        if(parseInt(data_arr[1]) == 1){
            $(this).addClass('fa-plus-square');
            $(this).data('cat',''+data_arr[0]+"|0");
            (row)?row.hide():0;
        }
        else{
            $(this).addClass('fa-minus-square');
            $(this).data('cat',data_arr[0]+"|1");
            (row)?row.show():0;
        }

    });

    $(document).on('click','.all_products',function(){

        $(this).removeClass('fa-minus-square');
        $(this).removeClass('fa-plus-square');
        if(tag){
            $(this).addClass('fa-plus-square');
            $($(document).find('.product_table').find('tbody')).hide();
            tag = false;
        }
        else{
            $(this).addClass('fa-minus-square');
            $($(document).find('.product_table').find('tbody')).show();
            tag = true;
        }

    });

    $(".custom_filter").click(function (event) {
         $(".filter_loader").show()
        event.preventDefault();
        let formData = $('.form_filter').serializeArray();
        let groupData = groupFormInputs(formData);
        let groups = groupFormInputs(formData)['group_by[]'];

         formData = {
            from        : $("#from").val(),
            end         : $("#end").val(),
            branch      : $("#branch").val(),
            product_by  : $("#product_by").val(),
            //user_by     : $("#user_by").val(),
            group_by    : JSON.stringify(groups),
            name        : $('#name').val()
        };
        if(formData.from && formData.from != null && formData.from != ''){
            $.ajax({
                type: 'POST',
                url: filter_url,
                data: formData,
                success: function (data) {
                    drawTable(data);
                    if (data.results.length!=0) {
                        $('.download').attr('disabled', false);
                    }
                    $(".filter_loader").hide()
                }
            });
        }
        else{
            bootbox.alert('check date filter inputs !!');
        }
    });


   function drawTable(data)
    {
        let reports= data.results;
        let dates=data.dates;
        let product_by=data.product_by
        let table_dom = $($('#table thead'));
        let table_body = $($('#table tbody'));

        $(table_dom.find('tr:first')).html('<th></th>');
        if (product_by==="PRO")
            $(table_dom.find('tr:nth-child(2)')).html('<th>Products</th>');
        if (product_by==="CAT")
            $(table_dom.find('tr:nth-child(2)')).html('<th>Category</th>');

        $(table_dom.find('tr:nth-child(3)')).remove();
        table_body.html('');
        re_dates = dates;

        let gr_total_qty = {};
        let gr_total_tot = {};

        fileName = dates[0] +" - "+dates[dates.length- 1]
        if (data.period=="DAY")
        {
            fileName=fileName+' DAILY Sales Report'
        }
        else
            fileName=fileName+" " +data.period+'LY Sales Report'


        for(let i = dates.length- 1; i>=0;i--){
            let day = dates[i];  //specific date
            var date=day;

            if(data.period == 'MONTH'){
                let temp = new Date(day);
                date = (temp.getMonth()+1) + '/' + temp.getFullYear();
            }
            else if(data.period == 'YEAR'){
                let temp = new Date(day);
                date = (temp.getMonth()+1) + '/' + temp.getFullYear();
            }
            $(table_dom.find('tr:first')).append('<th colspan="2">'+ date +'</th>');
            if(product_by==="PRO"){
                $(table_dom.find('tr:nth-child(2)')).append('<th style="white-space: pre-wrap;">Product Quantity</th>');
                $(table_dom.find('tr:nth-child(2)')).append('<th style="white-space: pre-wrap;">Total Revenue</th>');

            }else{
                $(table_dom.find('tr:nth-child(2)')).append('<th style="white-space: pre-wrap;">Category Quantity</th>');
                $(table_dom.find('tr:nth-child(2)')).append('<th style="white-space: pre-wrap;">Total Revenue</th>');

            }
            gr_total_qty[day]=[0]
            gr_total_tot[day]=[0]
        }

        let  repi = 0;//report Iteration
        let  dayi = 0; //day Iteration
        reports.forEach(report => {
            let tr = '<tr class="view_parent">'
            let td = ''
            if(product_by==="PRO") {
                td = '<td class="amount" style="text-align: left"><b>' + report.product_name + '</b></td>'
            }
            if(product_by==="CAT") {
                td = '<td class="amount" style="text-align: left"><b>' + report.categoryName + '</b></td>'
            }

            dates.slice().reverse().forEach(day => {
                itemQty = day.replace(/\s/g, "") + "_QTY"
                itemRev = day.replace(/\s/g, "") + "_REV"
                td=td+'<td class="amount" style="text-align: right"><b>' + report[itemQty] + '</b></td>'
                td=td+'<td class="amount" style="text-align: right"><b>' + report[itemRev] + '</b></td>'
                gr_total_qty[day]=parseInt(gr_total_qty[day])+parseInt(report[itemQty])
                gr_total_tot[day]=parseInt(gr_total_tot[day])+parseInt(report[itemRev])
                dayi++
            })
            td=td+'<td class="amount" style="text-align: right"><b>' + report.Total_QTY+ '</b></td>'
            td=td+'<td class="amount" style="text-align: right"><b>' + report.Total_REV+ '</b></td>'
            tr=tr+td+'</tr>'
            table_body.append(tr)
            repi++
        })



        $(table_dom.find('tr:first')).append('<th colspan="2">Total</th>');
        $(table_dom.find('tr:nth-child(2)')).append('<th style="white-space: pre-wrap;">Product Quantity</th>');
        $(table_dom.find('tr:nth-child(2)')).append('<th style="white-space: pre-wrap;">Total Revenue</th>');

        let h_row = '<tr style="border-bottom: solid gray"><th style="text-align: left"> Total</th>';

        for(let q = 0; q<gr_total_qty;q++){
            //console.log(q);
            h_row += '<th>'+gr_total_qty[0]+'</th>';
        }

        let val1_tot = 0;
        let val2_tot = 0;

        dates.slice().reverse().forEach(day => {
            let val1 = gr_total_qty[day]
            let val2 = gr_total_tot[day]
            h_row += '<th style="text-align: right">'+val1+'</th>';
            h_row += '<th style="text-align: right">'+val2+'</th>';
            val1_tot += parseInt(val1);
            val2_tot += parseInt(val2);
        })
        h_row += '<th style="text-align: right">'+val1_tot+'</th>';
        h_row += '<th style="text-align: right">'+val2_tot+'</th>';
        table_dom.append(h_row+'</tr>');



    }

    $('.download').click(function(){
    
        $(".download_loader").show()
      
        // $.ajax({
        //     type: 'POST',
        //     url: filter_url+'/report',
        //     data: {
        //         report : sales_reports,
        //         dates : JSON.stringify(re_dates),
        //         categories : JSON.stringify(categories),
        //         from : $("#from").val(),
        //         end : $("#end").val()
        //     },
        //     success: function (data) {
        //         if(data.status == 200){
        //             $('#file_name').val(data.link);
        //             $('#revenue_download').click();
        //             $(".download_loader").hide()
        //         }
        //     },
        //     failed : function(){
        //         bootbox.alert('download failed !!');
        //         $(".download_loader").hide()
        //     }
        // });


        exportTableToExcel("table",fileName)
    });

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


    $('.refresh').click(function(){
        //$('.bar_chart').show();
        //$('.product_table').hide();
        $(".custom_filter").click();
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
    $(".download_loader").hide()
});