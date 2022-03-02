/**
 * Created by tharindu on 2/6/2018.
 */
$(document).ready(function () {

    /**
     * update table on change of branch id, transfer type or date
     */
    $('#branchId,#typeId,#date').change(function () {
        updateTable();
    });

    /*
    * update table on change of search_by_name
    */
   $('#search_by_name').keyup(function(){
       updateTableForName();
   })

    /**
     * next button action
     */
    $("#nextButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());
        $("#pageNumber").text(pageNumber + 1);
        $("#prevButton").prop('disabled', false);
        updateTable();
    });

    /**
     * previous button action
     */
    $("#prevButton").click(function () {
        $("#table tr").remove();
        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());
        if (pageNumber <= 1) {
            $("#prevButton").prop('disabled', true);
        } else {
            $("#pageNumber").text(pageNumber - 1);
            updateTable();
        }
    });






    function updateTable() {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th id='header1'>Transfer Reference</th><th>Source</th><th>Item Count</th><th>Date</th><th>Transfer Type<th>Action</th></tr>"; // add resources
        $("#table").append(someRow);

        let source = $("#branchId").val();
        let typeId = $("#typeId").val();
        let date = $("#date").val();
        let perPageResults = 25;

        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());

        let data = {
            source: source,
            pageNumber: pageNumber,
            typeId: typeId,
            date: date,
            limit: perPageResults,
            offset: (pageNumber - 1) * perPageResults
        }
        $.ajax({
            type: "GET",
            url: url1,
            data: data,
            success: function (result) {

                let table = document.getElementById("table");
                for (let i = 0; i < result.length; i++) {
                    let button2 = $('<a class="editButton btn btn-success fa fa-eye " data-id="' + result[i].id + '"></a>');
                    button2.data('id', result[i].id);
                    let tr = table.insertRow(-1);
                    let tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].grnNo;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].branch.branchName;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].itemCount;
                    tabCell = tr.insertCell(-1);
                    /* For date and time formating */
                    let current_datetime = new Date(result[i].date);

                    let c_month = new Array();
                    c_month[0] = "01"; c_month[1] = "02"; c_month[2] = "03"; c_month[3] = "04"; c_month[4] = "05"; c_month[5] = "06"; c_month[6] = "07"; c_month[7] = "08"; c_month[8] = "09"; c_month[9] = "10"; c_month[10] = "11"; c_month[11] = "12";
                    let c_date = new Array();
                    c_date[0] = "00"; c_date[1] = "01"; c_date[2] = "02"; c_date[3] = "03"; c_date[4] = "04"; c_date[5] = "05"; c_date[6] = "06"; c_date[7] = "07"; c_date[8] = "08"; c_date[9] = "09"; c_date[10] = "10"; c_date[11] = "11"; c_date[12] = "12"; c_date[13] = "13"; c_date[14] = "14"; c_date[15] = "15"; c_date[16] = "16"; c_date[17] = "17"; c_date[18] = "18"; c_date[19] = "19"; c_date[20] = "20"; c_date[21] = "21"; c_date[22] = "22"; c_date[23] = "23"; c_date[24] = "24"; c_date[25] = "25"; c_date[26] = "26"; c_date[27] = "27"; c_date[28] = "28"; c_date[29] = "29"; c_date[30] = "30"; c_date[31] = "31";
                    let c_hours = new Array();
                    c_hours[0] = "00"; c_hours[1] = "01"; c_hours[2] = "02"; c_hours[3] = "03"; c_hours[4] = "04"; c_hours[5] = "05"; c_hours[6] = "06"; c_hours[7] = "07"; c_hours[8] = "08"; c_hours[9] = "09"; c_hours[10] = "10"; c_hours[11] = "11"; c_hours[12] = "12"; c_hours[13] = "13"; c_hours[14] = "14"; c_hours[15] = "15"; c_hours[16] = "16"; c_hours[17] = "17"; c_hours[18] = "18"; c_hours[19] = "19"; c_hours[20] = "20"; c_hours[21] = "21"; c_hours[22] = "22"; c_hours[23] = "23";
                    let c_mint = new Array();
                    c_mint[0] = "00"; c_mint[1] = "01"; c_mint[2] = "02"; c_mint[3] = "03"; c_mint[4] = "04"; c_mint[5] = "05"; c_mint[6] = "06"; c_mint[7] = "07"; c_mint[8] = "08"; c_mint[9] = "09"; c_mint[10] = "10"; c_mint[11] = "11"; c_mint[12] = "12"; c_mint[13] = "13"; c_mint[14] = "14"; c_mint[15] = "15"; c_mint[16] = "16"; c_mint[17] = "17"; c_mint[18] = "18"; c_mint[19] = "19"; c_mint[20] = "20"; c_mint[21] = "21"; c_mint[22] = "22"; c_mint[23] = "23"; c_mint[24] = "24"; c_mint[25] = "25"; c_mint[26] = "26"; c_mint[27] = "27"; c_mint[28] = "28"; c_mint[29] = "29"; c_mint[30] = "30"; c_mint[31] = "31"; c_mint[32] = "32"; c_mint[33] = "33"; c_mint[34] = "34"; c_mint[35] = "35"; c_mint[36] = "36"; c_mint[37] = "37"; c_mint[38] = "38"; c_mint[39] = "39"; c_mint[40] = "40"; c_mint[41] = "41"; c_mint[42] = "42"; c_mint[43] = "43"; c_mint[44] = "44"; c_mint[45] = "45"; c_mint[46] = "46"; c_mint[47] = "47"; c_mint[48] = "48"; c_mint[49] = "49"; c_mint[50] = "50"; c_mint[51] = "51"; c_mint[52] = "52"; c_mint[53] = "53"; c_mint[54] = "54"; c_mint[55] = "55"; c_mint[56] = "56"; c_mint[57] = "57"; c_mint[58] = "58"; c_mint[59] = "59";
                    let c_sec = new Array();
                    c_sec[0] = "00"; c_sec[1] = "01"; c_sec[2] = "02"; c_sec[3] = "03"; c_sec[4] = "04"; c_sec[5] = "05"; c_sec[6] = "06"; c_sec[7] = "07"; c_sec[8] = "08"; c_sec[9] = "09"; c_sec[10] = "10"; c_sec[11] = "11"; c_sec[12] = "12"; c_sec[13] = "13"; c_sec[14] = "14"; c_sec[15] = "15"; c_sec[16] = "16"; c_sec[17] = "17"; c_sec[18] = "18"; c_sec[19] = "19"; c_sec[20] = "20"; c_sec[21] = "21"; c_sec[22] = "22"; c_sec[23] = "23"; c_sec[24] = "24"; c_sec[25] = "25"; c_sec[26] = "26"; c_sec[27] = "27"; c_sec[28] = "28"; c_sec[29] = "29"; c_sec[30] = "30"; c_sec[31] = "31"; c_sec[32] = "32"; c_sec[33] = "33"; c_sec[34] = "34"; c_sec[35] = "35"; c_sec[36] = "36"; c_sec[37] = "37"; c_sec[38] = "38"; c_sec[39] = "39"; c_sec[40] = "40"; c_sec[41] = "41"; c_sec[42] = "42"; c_sec[43] = "43"; c_sec[44] = "44"; c_sec[45] = "45"; c_sec[46] = "46"; c_sec[47] = "47"; c_sec[48] = "48"; c_sec[49] = "49"; c_sec[50] = "50"; c_sec[51] = "51"; c_sec[52] = "52"; c_sec[53] = "53"; c_sec[54] = "54"; c_sec[55] = "55"; c_sec[56] = "56"; c_sec[57] = "57"; c_sec[58] = "58"; c_sec[59] = "59";
                    
                    let formated_date = current_datetime.getFullYear() + "-" + (c_month[current_datetime.getMonth()]) + "-" + (c_date[current_datetime.getDate()]) + " " + (c_hours[current_datetime.getHours()]) + ":" + (c_mint[current_datetime.getMinutes()]) + ":" + (c_sec[current_datetime.getSeconds()]);
                    /*//////////////////////////////*/
                    tabCell.innerHTML = formated_date;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].transferType.name;
                    tabCell = tr.insertCell(-1);
                    button2.appendTo(tabCell);
                }

                $("#pageNumber").text(pageNumber);
            }
        });


    }

    function updateTableForName() {
        $("#table tr").remove();
        let someRow = "<tr class='someClass' ><th id='header1'>Transfer Reference</th><th>Source</th><th>Date</th><th>Transfer Type<th>Action</th></tr>"; // add resources
        $("#table").append(someRow);

        let productName= $("#search_by_name").val();
        let source = $("#branchId").val();
        let typeId = $("#typeId").val();
        let date = $("#date").val();
        let perPageResults = 25;

        let pageNumber = isNaN(parseInt($("#pageNumber").text())) ? 1 : parseInt($("#pageNumber").text());

        let data = {
            productName:productName,
            source: source,
            pageNumber: pageNumber,
            typeId: typeId,
            date: date,
            limit: perPageResults,
            offset: (pageNumber - 1) * perPageResults
        }
        $.ajax({
            type: "GET",
            url: url2,
            data: data,
            success: function (result) {
                console.log('++++++');
                console.log(result);
                console.log(result.length);

                let table = document.getElementById("table");
                for (let i = 0; i < result.length; i++) {
                    let button2 = $('<a class="editButton btn btn-success fa fa-eye " data-id="' + result[i].id + '"></a>');
                    button2.data('id', result[i].id);
                    let tr = table.insertRow(-1);
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].grn_no;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].branch_name;
                    tabCell = tr.insertCell(-1);
                     /* For date and time formating */
                    let current_datetime = new Date(result[i].date);
                    
                    let c_month = new Array();
                    c_month[0] = "01"; c_month[1] = "02"; c_month[2] = "03"; c_month[3] = "04"; c_month[4] = "05"; c_month[5] = "06"; c_month[6] = "07"; c_month[7] = "08"; c_month[8] = "09"; c_month[9] = "10"; c_month[10] = "11"; c_month[11] = "12";
                    let c_date = new Array();
                    c_date[0] = "00"; c_date[1] = "01"; c_date[2] = "02"; c_date[3] = "03"; c_date[4] = "04"; c_date[5] = "05"; c_date[6] = "06"; c_date[7] = "07"; c_date[8] = "08"; c_date[9] = "09"; c_date[10] = "10"; c_date[11] = "11"; c_date[12] = "12"; c_date[13] = "13"; c_date[14] = "14"; c_date[15] = "15"; c_date[16] = "16"; c_date[17] = "17"; c_date[18] = "18"; c_date[19] = "19"; c_date[20] = "20"; c_date[21] = "21"; c_date[22] = "22"; c_date[23] = "23"; c_date[24] = "24"; c_date[25] = "25"; c_date[26] = "26"; c_date[27] = "27"; c_date[28] = "28"; c_date[29] = "29"; c_date[30] = "30"; c_date[31] = "31";
                    let c_hours = new Array();
                    c_hours[0] = "00"; c_hours[1] = "01"; c_hours[2] = "02"; c_hours[3] = "03"; c_hours[4] = "04"; c_hours[5] = "05"; c_hours[6] = "06"; c_hours[7] = "07"; c_hours[8] = "08"; c_hours[9] = "09"; c_hours[10] = "10"; c_hours[11] = "11"; c_hours[12] = "12"; c_hours[13] = "13"; c_hours[14] = "14"; c_hours[15] = "15"; c_hours[16] = "16"; c_hours[17] = "17"; c_hours[18] = "18"; c_hours[19] = "19"; c_hours[20] = "20"; c_hours[21] = "21"; c_hours[22] = "22"; c_hours[23] = "23";
                    let c_mint = new Array();
                    c_mint[0] = "00"; c_mint[1] = "01"; c_mint[2] = "02"; c_mint[3] = "03"; c_mint[4] = "04"; c_mint[5] = "05"; c_mint[6] = "06"; c_mint[7] = "07"; c_mint[8] = "08"; c_mint[9] = "09"; c_mint[10] = "10"; c_mint[11] = "11"; c_mint[12] = "12"; c_mint[13] = "13"; c_mint[14] = "14"; c_mint[15] = "15"; c_mint[16] = "16"; c_mint[17] = "17"; c_mint[18] = "18"; c_mint[19] = "19"; c_mint[20] = "20"; c_mint[21] = "21"; c_mint[22] = "22"; c_mint[23] = "23"; c_mint[24] = "24"; c_mint[25] = "25"; c_mint[26] = "26"; c_mint[27] = "27"; c_mint[28] = "28"; c_mint[29] = "29"; c_mint[30] = "30"; c_mint[31] = "31"; c_mint[32] = "32"; c_mint[33] = "33"; c_mint[34] = "34"; c_mint[35] = "35"; c_mint[36] = "36"; c_mint[37] = "37"; c_mint[38] = "38"; c_mint[39] = "39"; c_mint[40] = "40"; c_mint[41] = "41"; c_mint[42] = "42"; c_mint[43] = "43"; c_mint[44] = "44"; c_mint[45] = "45"; c_mint[46] = "46"; c_mint[47] = "47"; c_mint[48] = "48"; c_mint[49] = "49"; c_mint[50] = "50"; c_mint[51] = "51"; c_mint[52] = "52"; c_mint[53] = "53"; c_mint[54] = "54"; c_mint[55] = "55"; c_mint[56] = "56"; c_mint[57] = "57"; c_mint[58] = "58"; c_mint[59] = "59";
                    let c_sec = new Array();
                    c_sec[0] = "00"; c_sec[1] = "01"; c_sec[2] = "02"; c_sec[3] = "03"; c_sec[4] = "04"; c_sec[5] = "05"; c_sec[6] = "06"; c_sec[7] = "07"; c_sec[8] = "08"; c_sec[9] = "09"; c_sec[10] = "10"; c_sec[11] = "11"; c_sec[12] = "12"; c_sec[13] = "13"; c_sec[14] = "14"; c_sec[15] = "15"; c_sec[16] = "16"; c_sec[17] = "17"; c_sec[18] = "18"; c_sec[19] = "19"; c_sec[20] = "20"; c_sec[21] = "21"; c_sec[22] = "22"; c_sec[23] = "23"; c_sec[24] = "24"; c_sec[25] = "25"; c_sec[26] = "26"; c_sec[27] = "27"; c_sec[28] = "28"; c_sec[29] = "29"; c_sec[30] = "30"; c_sec[31] = "31"; c_sec[32] = "32"; c_sec[33] = "33"; c_sec[34] = "34"; c_sec[35] = "35"; c_sec[36] = "36"; c_sec[37] = "37"; c_sec[38] = "38"; c_sec[39] = "39"; c_sec[40] = "40"; c_sec[41] = "41"; c_sec[42] = "42"; c_sec[43] = "43"; c_sec[44] = "44"; c_sec[45] = "45"; c_sec[46] = "46"; c_sec[47] = "47"; c_sec[48] = "48"; c_sec[49] = "49"; c_sec[50] = "50"; c_sec[51] = "51"; c_sec[52] = "52"; c_sec[53] = "53"; c_sec[54] = "54"; c_sec[55] = "55"; c_sec[56] = "56"; c_sec[57] = "57"; c_sec[58] = "58"; c_sec[59] = "59";
                    
                    let formated_date = current_datetime.getFullYear() + "-" + (c_month[current_datetime.getMonth()]) + "-" + (c_date[current_datetime.getDate()]) + " " + (c_hours[current_datetime.getHours()]) + ":" + (c_mint[current_datetime.getMinutes()]) + ":" + (c_sec[current_datetime.getSeconds()]);
                    /*//////////////////////////////*/
                    tabCell.innerHTML = formated_date;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = result[i].name;
                    tabCell = tr.insertCell(-1);
                    button2.appendTo(tabCell);
                }

                $("#pageNumber").text(pageNumber);
            }
        });


    }





});




