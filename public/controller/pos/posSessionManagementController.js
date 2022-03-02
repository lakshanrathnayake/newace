$(document).ready(function () {
    OuterHeight = setHeightOuter();
    $('#div_ses').css('height', OuterHeight);






    $( window ).resize(function() {
        OuterHeight = setHeightOuter();
        $('#div_ses').css('height', OuterHeight);

    });


    function setHeightOuter()
    {
        var  OuterHeight =$( window).height()-$('#navbar1').height();
        return OuterHeight

    }


    });