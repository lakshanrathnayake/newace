/**
 * Created by tharindu on 2/2/2018.
 */
$(document).ready(function () {

    $("form").submit(function () {
        bootbox.confirm("Are you sure that you want to add this supplier?", function (confirm) {
            if (confirm) {
                let data = $('#data').serialize();
                //console.log(data);

                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (result) {
                        bootbox.alert("Supplier added successfully", function () {
                            $("#supplierName").val("");
                            $("#telephone").val("");
                            $("#address").val("");
                            $("#email").val("");
                            location.reload();
                        })
                    }
                });
            }
        });
    });

});