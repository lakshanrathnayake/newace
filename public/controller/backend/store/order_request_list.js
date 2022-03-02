$(document).ready(function () {


    $("#accept").click(function () {
        bootbox.confirm("Are you sure that you want to accept this order request?", function(confirm){
            if(confirm) {
                let orderRequestId = $("#transferId").val();

                $.ajax({
                    type: "POST",
                    url: url1,
                    data: orderRequestId,
                    success: function (result) {
                        bootbox.alert("Order request accepted", function () {
                            window.location = document.referrer;
                        })

                    }
                });
            }
        })

    });

    $("#reject").click(function () {
        bootbox.confirm("Are you sure that you want to accept this order request?", function(confirm){
            if(confirm) {
                let orderRequestId = $("#transferId").val();

                $.ajax({
                    type: "POST",
                    url: url2,
                    data: orderRequestId,
                    success: function (result) {
                        bootbox.alert("Order request rejected", function () {
                            window.location = document.referrer;
                        })
                    }
                });
            }
        })
    });


});
