$(document).ready(function () {


        $('.small_Modal').click(function(){
            console.log('xxxxxr');
            $('.discount_Modal' ).modal();
        });


    var r = $(document).height();
    console.log(r);

    $('#btnQty').addClass('active')

    var selectedProductId;
    var selectedButton="Qty";  //Variable to identify which button of Qty,Disc,Price,Taxes selected
    var displayQuantity='';
    var displayPrice='';
    var displayDiscount;
    var displayTaxes;
    var productRowIds=[];




  //  Setting height to the elements with respect to windows
  /*
  *
  *
  *
  * */


    var x=$(window).height();

    console.log(x);

  $('#posdiv').css('height',setHeightLeft());

  $('#rightdiv3').css('height',setHeightRight());


  //Setting the height of the elements with respect to window height on resize
    $( window ).resize(function() {

        $('#posdiv').css('height',setHeightLeft());


        $('#rightdiv3').css('height',setHeightRight());
    });







    //adding goods to the bill


    $('img').click(function(event){

        //alert("The paragraph was clicked.");
        var id=event.target.id;
        var newId="product_row_"+id;


        var myEle = document.getElementById(newId);
        if(myEle){

        }

        else{




            $( "#rowGoodList" ).append( "<div class=\"row generated\" id=\""+newId+"\">\n" +
                "                    <div class=\"row\" style=\"margin-left: 5px\">\n" +
                "                        <div class=\"form-group col-sm-3\" style='margin-bottom: 0px'>\n" +
                "                            <label style='font-size: 18px'>" +id+"</label>\n" +
                "                        </div>\n" +
                "\n" +
                "                        <div class=\"form-group col-sm-7\">\n" +
                "\n" +
                "                        </div>\n" +
                "\n" +
                "\n" +
                "                        <div class=\"form-group col-sm-2\" style='margin-bottom: 0px' >\n" +
                "                            <label style='font-size: 18px;margin-left: -35px'> $<span class='total'>0.00</span></label>\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "\n" +
                "                    <div class=\"row\" style=\"margin-left: 20px\">\n" +
                "                    <label><span class='quantity'>0</span> Units@$<span class='uPrice'>0.00</span> per unit</label>\n" +
                "\n" +
                "                    </div>\n" +
                "\n" +"<div class='row discountRow'  style='margin-left: 20px;display: none'><label>Discounts @ <span class='productDiscount'>0</span> %</label></div>\n"+
                "\n" + "<div class='row' style='height: 10px'></div>\n"+
                "                </div>");





            productRowIds.push(newId);
            console.log(productRowIds);

        }


        $('#rowPriceTotal').show()

        //Selecting a  good from the list
        $("#"+newId).on("click", function(){

            if ($( '.row.generated' ).hasClass( "intro" )){
                $('.row.generated').removeClass('intro')

            }

            $("#"+newId).addClass('intro')
            selectedProductId=newId;



            displayQuantity = $('#'+selectedProductId+' .quantity').text();
            displayPrice = $('#'+selectedProductId+' .uPrice').text();
            displayDiscount =  $('#'+selectedProductId+' .productDiscount').text();


            });
        setTotalAmount();
        });



          //key pad action


         $( ".numpad" ).click(function(event) {


             switch (selectedButton){

                 case "Qty":

                     if (displayQuantity==="0"){
                         displayQuantity=''
                     }

                     if (event.target.id==='btnDot' && (displayQuantity.indexOf('.')!==-1)){
                        return
                     }


                     var n2=$('#'+event.target.id).text();
                     displayQuantity+=n2;



                     $('#'+selectedProductId+' .quantity').text(displayQuantity);

                     setRowTotal(selectedProductId);



                     $('#fullTotal').text(setTotalAmount());

                     setTax();

                     break;

                 case "Price":

                     if (displayPrice==="0.00"){
                         displayPrice=''

                     }

                     if (event.target.id==='btnDot' && (displayPrice.indexOf('.')!==-1)){
                         return
                     }

                     var n3=$('#'+event.target.id).text();
                     displayPrice+=n3;

                     $('#'+selectedProductId+' .uPrice').text(Number(displayPrice).toFixed(2));

                     setRowTotal(selectedProductId);
                     $('#fullTotal').text(setTotalAmount());
                     setTax();

                     break;
                 case "Taxes":

                     displayTaxes=$('#totalTaxes').text();

                     if (displayTaxes==="0"){
                         displayTaxes='';
                     }

                     if (event.target.id==='btnDot' && (displayTaxes.indexOf('.')!==-1)){
                         return;
                     }

                     var textOfTheButton=$('#'+event.target.id).text();
                     displayTaxes+=textOfTheButton;

                     $('#totalTaxes').text(displayTaxes);

                     setTax();


                     break;


                 case "Disc":

                     $('#'+selectedProductId+' .row.discountRow').show();

                     if (displayDiscount==="0"){
                         displayDiscount=''

                     }

                     if (event.target.id==='btnDot' && (displayDiscount.indexOf('.')!==-1)){
                         return
                     }

                     var textOfButtonPressed=$('#'+event.target.id).text();
                     displayDiscount+=textOfButtonPressed;

                     $('#'+selectedProductId+' .productDiscount').text(displayDiscount);

                     setRowTotal(selectedProductId);


                     $('#fullTotal').text(setTotalAmount());

                     setTax();


                     break;


                 default:
                     console.log("Done");

             }

    });



    $("#btnCancel").click(function(){


        switch (selectedButton){

            case 'Qty':

                var currentValue= $('#'+selectedProductId+' .quantity').text();

                if (currentValue==='0'){
                    $( '#'+selectedProductId ).remove();

                    var index=productRowIds.indexOf(selectedProductId);

                    productRowIds.splice(index, 1);

                    if (productRowIds.length===0){
                        $('#rowPriceTotal').hide()
                    }


                    return;
                }

                var newValue = currentValue.slice(0, -1);
                displayQuantity=newValue;

                if (newValue===''){
                    $('#'+selectedProductId+' .quantity' ).text('0');
                    setRowTotal(selectedProductId);

                    $('#fullTotal').text(setTotalAmount());
                    return;
                }

                console.log(newValue);

                $('#'+selectedProductId+' .quantity').text(newValue);

                setRowTotal(selectedProductId);

                $('#fullTotal').text(setTotalAmount());




                break;




            case "Price":

                var currentValue= $('#'+selectedProductId+' .uPrice').text();

                if (currentValue==='0.00'){
                    $( '#'+selectedProductId ).remove();

                    var index=productRowIds.indexOf(selectedProductId);

                    productRowIds.splice(index, 1);

                    if (productRowIds.length===0){
                        $('#rowPriceTotal').hide()
                    }


                    return;
                }

                var newValue = currentValue.slice(0, -1);
                displayPrice=newValue;

                if (newValue===''){
                    $ ('#'+selectedProductId+' .uPrice').text('0.00');
                    setRowTotal(selectedProductId);

                    $('#fullTotal').text(setTotalAmount());

                    return;
                }


                $('#'+selectedProductId+' .uPrice').text(newValue);
                setRowTotal(selectedProductId);

                $('#fullTotal').text(setTotalAmount());


                break;



            case "Disc":

                var currentValue= $('#'+selectedProductId+' .productDiscount').text();

                if (currentValue==='0'){
                    $( '#'+selectedProductId+' .discountRow' ).hide();
                    return;
                }


                var newValue = currentValue.slice(0, -1);
                displayDiscount=newValue;

                if (newValue===''){
                    $ ('#'+selectedProductId+' .productDiscount').text('0');
                    setRowTotal(selectedProductId);

                    $('#fullTotal').text(setTotalAmount());
                    return;
                }

                $('#'+selectedProductId+' .productDiscount').text(newValue);


                setRowTotal(selectedProductId);

                $('#fullTotal').text(setTotalAmount());


            case "Taxes":


                var currentValue = $('#totalTaxes').text();


                if (currentValue==='0'){

                    return;
                }

                var newValue = currentValue.slice(0, -1);



                if (newValue===''){
                    $ ('#totalTaxes').text('0');
                    setTax();

                    return;
                }

                displayTaxes=newValue;

                 $('#totalTaxes').text(newValue);
                setTax();

                break;

            default:
                break;




        }



    });



// Selecting one of qty,discount,prices,taxes

    $("#btnQty").click(function(){
        // alert("Cancel Clicked");

        if ($( '#cal button.btn-default.selection' ).hasClass( 'active' )){
            $( '#cal button.btn-default.selection').removeClass('active')

        }

        $( '#btnQty ').addClass('active');
        selectedButton="Qty"



    });


    $("#btnDisc").click(function(){


        if ($( '#cal button.btn-default.selection' ).hasClass( 'active' )){
            $( '#cal button.btn-default.selection').removeClass('active')

        }

        $( '#btnDisc ').addClass('active');
        selectedButton="Disc"


    });


    $("#btnPrice").click(function(){


        if ($( '#cal button.btn-default.selection' ).hasClass( 'active' )){
            $( '#cal button.btn-default.selection').removeClass('active')

        }

        $( '#btnPrice ').addClass('active');
        selectedButton="Price"



    });




    $("#btnTaxes").click(function(){


        if ($( '#cal button.btn-default.selection' ).hasClass( 'active' )){
            $( '#cal button.btn-default.selection').removeClass('active')

        }

        $( '#btnTaxes ').addClass('active');
        selectedButton="Taxes"


    });


    $("#btnPayment").click(function(){

        if (productRowIds.length===0){
            return;
        }
        else {

            productRowIds.forEach(function(rowId) {
                console.log(rowId);
                var total=  $('#'+rowId+' .total').text();
                var units=  $('#'+rowId+' .quantity').text();
                var unitPrice=$('#'+rowId+' .uPrice').text();
                var discount=$('#'+rowId+' .productDiscount').text();

                console.log(units);
                console.log(unitPrice);
                console.log(discount);
                console.log(total);

            });


        }




    });



    // function to calculate  total of the bill;
    function setTotalAmount() {
        var totalOfTheBill= 0;
        var totalArray=$('#rowGoodList').find('.total');

        $.each(totalArray, function (key, value) {
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
            var rowTotal=Number($(value).html());
            totalOfTheBill+=rowTotal;

        });

        return totalOfTheBill.toFixed(2);
    }



    // Setting total  for Each Product with discount
    function  setRowTotal(selectedProductId) {

        var total=Number( $('#'+selectedProductId+' .quantity').text())*Number( $('#'+selectedProductId+' .uPrice').text());
        $('#'+selectedProductId+' .total').text(total.toFixed(2));


        if($('#'+selectedProductId+' .row.discountRow').is(':visible')) {

            var totalAfterDiscount=((100-Number( $('#'+selectedProductId+' .productDiscount').text()))/100)*
                                                 Number( $('#'+selectedProductId+' .quantity').text())*Number( $('#'+selectedProductId+' .uPrice').text());

            $('#'+selectedProductId+' .total').text(totalAfterDiscount.toFixed(2));

        }


    }

    // Function to set Tax

    function setTax() {

        var totalWithOutTax=setTotalAmount()
        var totalAfterTax=((100+Number( $('#totalTaxes').text()))/100)*totalWithOutTax;
        $('#fullTotal').text(totalAfterTax.toFixed(2));

    }






});

function setHeightLeft()
{
    var windowHeight =$( window).height()-50-$('#cal').height();
    return windowHeight

}

function setHeightRight() {

    var windowHeightR =$( window ).height()-50-$('#rightdiv1').height()-$('#rightdiv2').height();
    return windowHeightR

}


