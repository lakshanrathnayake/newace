$(document).ready(function () {

    OuterHeight = setHeightOuter();
    $('#divcon1').css('height',OuterHeight);
    $('#divcon2').css('height',OuterHeight);
    $('#divcon3').css('height',OuterHeight);





    $( window ).resize(function() {
        OuterHeight = setHeightOuter();
        $('#divcon1').css('height',OuterHeight);
        $('#divcon2').css('height',OuterHeight);
        $('#divcon3').css('height',OuterHeight);



    });


    $('#btnRefresh').click(function(){

        $('input[type=text]').each(function() {
            $(this).val('');
        });


        $('#addCustomerDiv').hide(500);
        $( "#btnAddUser" ).prop( "disabled", false );
    });

    $('#btnAddUser').click(function(){

        $( "#btnAddUser" ).prop( "disabled", true );
        $('#addCustomerDiv').show(500);
    });


    $('#btnSave').click(function(){
        $('input[type=text]').each(function() {
            $(this).val('');
        });


        $('#addCustomerDiv').hide(500);
        $( "#btnAddUser" ).prop( "disabled", false );
    });






});

function setHeightOuter()
{
    var  OuterHeight =$( window).height()-$('#navbar1').height();
    return OuterHeight

}

