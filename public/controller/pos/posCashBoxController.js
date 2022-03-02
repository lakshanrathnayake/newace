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


    var total=0;

    var fivethousand_value=0;


    $('#fiveThousandIn').on('input', function() {
        var fiveThousand = $('#fiveThousandIn').val();

        var fiveThousand_value = 0;
        var existing = $('#fiveThousandTotal').text();

        existing = parseInt(existing);
        if(fiveThousand && fiveThousand != null){
            (parseInt(fiveThousand) && parseInt(fiveThousand) != NaN) ? fiveThousand_value=fiveThousand*5000:0;
        }

        $('#fiveThousandTotal').text(fiveThousand_value);
        total=total+fiveThousand_value - (existing);
        $('#total').text(total);
    });



    $('#twoThousandIn').on('input', function() {
        var twoThousand = $('#twoThousandIn').val();
        var twothousand_value = 0;
        var existing = $('#twoThousandTotal').text();
        existing = parseInt(existing);
        if(twoThousand && twoThousand != null){
            (parseInt(twoThousand) && parseInt(twoThousand) != NaN) ? twothousand_value=twoThousand*2000:0;
        }
        $('#twoThousandTotal').text(twothousand_value);
        total=total+twothousand_value - (existing);
        $('#total').text(total);
    });


    $('#thousandIn').on('input', function() {
        var thousand = $('#thousandIn').val();
        var thousand_value = 0;
        var existing = $('#thousandTotal').text();
        existing = parseInt(existing);
        if(thousand && thousand != null){
            (parseInt(thousand) && parseInt(thousand) != NaN) ? thousand_value=thousand*1000:0;
        }

        $('#thousandTotal').text(thousand_value);
        total=total+thousand_value - (existing);
        $('#total').text(total);
    });




    $('#fiveHundredIn').on('input', function() {
        var fiveHundred = $('#fiveHundredIn').val();
        var fiveHundred_value = 0;
        var existing = $('#fiveHundredTotal').text();
        existing = parseInt(existing);
        if(fiveHundred && fiveHundred != null){
            (parseInt(fiveHundred) && parseInt(fiveHundred) != NaN) ?  fiveHundred_value=fiveHundred*500:0;
        }

        $('#fiveHundredTotal').text(fiveHundred_value);
        total=total+fiveHundred_value - (existing);
        $('#total').text(total);
    });


    $('#hundredIn').on('input', function() {
        var hundred = $('#hundredIn').val();
        var hundred_value = 0;
        var existing = $('#hundredTotal').text();
        existing = parseInt(existing);
        if(hundred && hundred != null){
            (parseInt(hundred) && parseInt(hundred) != NaN) ?  hundred_value=hundred*100:0;
        }

        $('#hundredTotal').text(hundred_value);
        total=total+hundred_value - (existing);
        $('#total').text(total);
    });


    $('#fiftyIn').on('input', function() {
        var fifty = $('#fiftyIn').val();
        var fifty_value = 0;
        var existing = $('#fiftyTotal').text();
        existing = parseInt(existing);
        if(fifty && fifty != null){
            (parseInt(fifty) && parseInt(fifty) != NaN) ?  fifty_value=fifty*50:0;
        }

        $('#fiftyTotal').text(fifty_value);
        total=total+fifty_value - (existing);
        $('#total').text(total);
    });


    $('#twentyIn').on('input', function() {
        var twenty = $('#twentyIn').val();
        var twenty_value = 0;
        var existing = $('#twentyTotal').text();
        existing = parseInt(existing);
        if(twenty && twenty != null){
            (parseInt(twenty) && parseInt(twenty) != NaN) ?  twenty_value=twenty*20:0;
        }

        $('#twentyTotal').text(twenty_value);
        total=total+twenty_value - (existing);
        $('#total').text(total);

    });


    $('#tenIn').on('input', function() {
        var ten = $('#tenIn').val();
        var ten_value = 0;
        var existing = $('#tenTotal').text();
        existing = parseInt(existing);
        if(ten && ten != null){
            (parseInt(ten) && parseInt(ten) != NaN) ?  ten_value=ten*10:0;
        }

        $('#tenTotal').text(ten_value);
        total=total+ten_value - (existing);
        $('#total').text(total);

    });


    $('#fiveIn').on('input', function() {
        var five = $('#fiveIn').val();
        var five_value = 0;
        var existing = $('#fiveTotal').text();
        existing = parseInt(existing);
        if(five && five != null){
            (parseInt(five) && parseInt(five) != NaN) ?  five_value=five*5:0;
        }

        $('#fiveTotal').text(five_value);
        total=total+five_value - (existing);
        $('#total').text(total);

    });


    $('#twoIn').on('input', function() {
        var two = $('#twoIn').val();
        var two_value = 0;
        var existing = $('#twoTotal').text();
        existing = parseInt(existing);
        if(two && two != null){
            (parseInt(two) && parseInt(two) != NaN) ?two_value=two*2:0;
        }

        $('#twoTotal').text(two_value);
        total=total+two_value - (existing);
        $('#total').text(total);
    });


    $('#oneIn').on('input', function() {
        var one= $('#oneIn').val();
        var one_value = 0;
        var existing = $('#oneTotal').text();
        existing = parseInt(existing);
        if(one && one != null){
            (parseInt(one) && parseInt(one) != NaN) ?one_value=one*1:0;
        }

        $('#oneTotal').text(one_value);
        total=total+one_value - (existing);
        $('#total').text(total);

    });


    // $('#halfIn').on('input', function() {
    //     var half = $('#halfIn').val();
    //     var half_value = 0;
    //     var existing = $('#halfTotal').text();
    //     existing = parseInt(existing);
    //     alert(existing)
    //     if(half && half != null){
    //
    //         half_value=half*0.5;
    //
    //     }
    //
    //     $('#halfTotal').text(half_value);
    //     total=total+ half_value - (existing);
    //     alert(total)
    //     $('#total').text(total);
    //
    // });



    function setHeightOuter()
    {
        var  OuterHeight =$( window).height()-$('#navbar1').height();
        return OuterHeight

    }



});