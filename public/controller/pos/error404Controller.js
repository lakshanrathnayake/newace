$(document).ready(function () {

    windowHeight = setHeight();
    $('#img1').css('height',windowHeight);
    $('#div1').css('height',windowHeight);

    windowWidth=setWidth();
    $('#img1').css('width',windowWidth);
    $('#div1').css('width',windowWidth);

    $( window ).resize(function() {
        windowHeight = setHeight();
        $('#img1').css('height',windowHeight);
        $('#div1').css('height',windowHeight);

        windowWidth=setWidth();
        $('#img1').css('width',windowWidth);
        $('#div1').css('width',windowWidth);
    });



});

function setHeight()
{
    var windowHeight =$( window).height();
    return windowHeight

}

function setWidth() {

    var windowWidth=$( window ).width();
    return windowWidth

}