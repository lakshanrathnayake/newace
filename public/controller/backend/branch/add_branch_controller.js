$(document).ready(function () {
    $("#form").submit(function () {
        bootbox.confirm("Are you sure that you want to add this branch?", function (confirm) {
            if (confirm) {
                let data = $('#form').serialize();
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (result) {
                        bootbox.alert("Branch added successfully!", function () {
                            let frm = document.getElementById("form");
                            frm.reset();
                        });
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        bootbox.alert("User adding failed!", function () {
                            let frm = document.getElementById("form");
                            frm.reset();
                        })
                    }
                });
            }
        });
    });
});