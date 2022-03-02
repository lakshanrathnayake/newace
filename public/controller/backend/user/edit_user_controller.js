/**
 * Created by Shashika on 3/11/2018.
 */
$(document).ready(function () {

    $('#is_update_password').on('click', function () {
        let container = $('#password_container');
        let input = $('#new_password');

        if($(this).is(':checked')) {
            container.show();
            input.attr('required', true);
        }
        else {

            container.hide();
            input.attr('required', false);
        }
    });

    $("#form").submit(function (e) {
        e.preventDefault();
        bootbox.confirm("Are you sure that you want to update this user?", function(confirm) {
            if(confirm) {
                let data = $('#form').serialize();
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (result) {

                        if(result.status === 500) {
                            bootbox.alert("User updated failed!", function () {
                                window.location.replace(redirectUri);
                            });
                        }
                        else if(result.status === 406) {
                            bootbox.alert("User with this username is already exist!", function () {
                                let frm = document.getElementById("form");
                                frm.reset();
                            });
                        }
                        else {
                            bootbox.alert("User updated successfully!", function () {
                                window.location.replace(redirectUri);
                            });
                        }
                    }
                });
            }
        });
    });
});