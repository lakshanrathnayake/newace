/**
 * Created by Shashika on 3/11/2018.
 */
$(document).ready(function () {
    $("#form").submit(function () {
        bootbox.confirm("Are you sure that you want to update this branch?", function (confirm) {
            if (confirm) {

            let data = $('#form').serialize();
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success: function (result) {
                    bootbox.alert("Branch updated successfully!", function () {
                        window.location = document.referrer;
                    });
                },
                error: function (xhr, textStatus, errorThrown) {
                    bootbox.alert("Branch updated failed!", function () {
                        window.location = document.referrer;
                    });
                }
            });
        }
    });
});
})
;