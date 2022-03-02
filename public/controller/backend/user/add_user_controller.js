$(document).ready(function () {
    $("#form").submit(function () {
        bootbox.confirm("Are you sure that you want to add this user?", function(confirm) {
            if(confirm) {
                let data = $('#form').serialize();
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (result) {
                        if(result.status == 500 ){
                            bootbox.alert("User with this username is already exist!", function () {
                                let frm = document.getElementById("form");
                                frm.reset();
                            });
                        }
                        else {
                            bootbox.alert("User added successfully!", function () {
                                let frm = document.getElementById("form");
                                frm.reset();
                            });
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {

                        bootbox.alert("User adding failed!", function () {
                            let frm = document.getElementById("form");
                            frm.reset();
                        });
                    }
                });
            }
        });
    });
});