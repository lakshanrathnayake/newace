$(document).ready(function () {

    OuterHeight = setHeightOuter();
    $('#outcoldiv1').css('height',OuterHeight);
    $('#outcoldiv2').css('height',OuterHeight);
    $('#outcoldiv3').css('height',OuterHeight);



    InnerHeight =setHeightInner()

    $('#incoldiv1').css('height',InnerHeight);
    $('#incoldiv2').css('height',InnerHeight);
    $('#incoldiv3').css('height',InnerHeight);


    $( window ).resize(function() {
        OuterHeight = setHeightOuter();
        $('#outcoldiv1').css('height',OuterHeight);
        $('#outcoldiv2').css('height',OuterHeight);
        $('#outcoldiv3').css('height',OuterHeight);

        InnerHeight =setHeightInner()

        $('#incoldiv1').css('height',InnerHeight);
        $('#incoldiv2').css('height',InnerHeight);
        $('#incoldiv3').css('height',InnerHeight);

    });



});

function setHeightOuter()
{
    var  OuterHeight =$( window).height()-$('#navbar1').height();
    return OuterHeight

}

function setHeightInner() {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    console.log($(window).height());
    console.log($('#navbar1').height());
    console.log($('#midrow1').height());
    console.log($('#midrow2').height());
    var InnerHeight = $(window).height() - $('#navbar1').height()-$('#midrow1').height()-$('#midrow2').height();
    return InnerHeight

}