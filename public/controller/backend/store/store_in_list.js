$(document).ready(function () {

    let table = document.getElementById("table");
    let tableData = tableToJson(table);

    

    $("#accept").click(function () {
         let table = document.getElementById("table");
         let tableData = tableToJson(table);
         console.log('tabledata confirm', tableData)
        let temp_var = [];
     
        $(".text").each(function () {
           // console.log("dddd");
        
        });
        bootbox.confirm("Are you sure that you want to accept this stores in?", function(confirm){
            if(confirm) {
                let orderRequestId = $("#transferId").val();
                var acceptqty = [];  
                var qty = [];  
              
                $("table tr td:nth-child(6)").each(function () {
                    acceptqty.push(parseInt($(this).text())); 
                }); 
                
                function filterArray(el) {
                    return (typeof (el) === "number"  && !isNaN(el));
                }
                
                
                var acceptqty = acceptqty.filter(filterArray)
             //  console.log('acceptqty',acceptqty)
               let acceptlength = acceptqty.length
              //  console.log('product length',acceptlength)
             
                
                $("table tr td:nth-child(4)").each(function () {
                    qty.push(parseInt($(this).text())); 
                });

                let hasNegative = acceptqty.some(v => v < 0);
            
              
                    result = [];

                   for(var i = 0;i<=acceptqty.length-1;i++){
                   result.push(qty[i] - acceptqty[i]);
                   }
                   let hasOverQty = result.some(v => v < 0);
              
             var rowCount = ($("#table tr").length)-(1)
         //    console.log('rowcount in table',rowCount)
              
                let data = {
                    tableData: tableData,
                    orderRequestId: orderRequestId,
                   // qty:qty
                }
                console.log(tableData,data);
                if(rowCount !== acceptlength ){
                    bootbox.alert('Can not leave empty quantity. Please fill correct value in accepted quantity field.')
                   
                }
                else if(hasNegative == true){
                    bootbox.alert('Can not accept negative quantities. Please enter correct quantity.')
                   
                }
                else if(hasOverQty == true){
                    bootbox.alert('Can not accept large quantitie than actual quantity. Please enter correct quantity.')
                   
                }
                else if(rowCount == acceptlength && hasNegative == false && hasOverQty == false){
                    console.log('sucess add')
                    $.ajax({
                        type: "POST",
                        url: url1,
                        data: data,
                        success: function (result) {
                            bootbox.alert("Store in accepted", function () {
                                window.location = document.referrer;
                            })
                        }
                    });
                }
                else{
                   bootbox.aler('Some error happen. Pleace check and add correct quantity')
                  
                }
                
            }
        });
    });

    $("#reject").click(function () {
        bootbox.confirm("Are you sure that you want to reject this store in?", function(confirm){
            if(confirm) {
                let orderRequestId = $("#transferId").val();

                $.ajax({
                    type: "POST",
                    url: url2,
                    data: orderRequestId,
                    success: function (result) {
                        bootbox.alert("Store in rejected", function () {
                            window.location = document.referrer;
                        })
                    }
                });
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

            for (let k = 0; k < (tableRow.cells.length) ; k++) {
                rowData[headers[k]] = tableRow.cells[k].innerHTML;
            }
            data.push(rowData);
        }
        return data;
    }


    

});
