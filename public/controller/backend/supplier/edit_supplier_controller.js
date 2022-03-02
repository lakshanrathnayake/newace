/**
 * Created by Shashika on 3/10/2018.
 */
/**
 * Created by tharindu on 2/2/2018.
 */
$(document).ready(function () {

    $("form").submit(function() {
        bootbox.confirm("Are you sure that you want to update this supplier?", function (confirm) {
            if(confirm) {
                let data = $('#data').serialize();

                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (result) {
                        bootbox.alert("Supplier updated successfully!", function () {
                            window.location = document.referrer;
                        })
                    }
                });
            }
        });
    });


});