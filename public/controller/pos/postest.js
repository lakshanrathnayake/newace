$(document).ready(function () {
    var  n1=$('#ans').text();


    $( ".num" ).click(function(event) {
        if (n1==="0"){
            n1=''
        }
        alert(event.target.id);
        var n2=$('#'+event.target.id).text();
        n1+=n2
        $('#ans').text(n1);
    });


});




//
// var  n1=$('#ans').text();
// alert(n1)
// var n2=event.target.id;;
// alert(n2)
//
// var n3=(Number(n1)*10)+Number(n2);
//
//
// $('#ans').text(n3);
//
//













