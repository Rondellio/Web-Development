// JavaScript source code
function updateChar(id) {
    $.ajax({
        url: '/charBuild/' + id,
        type: 'PUT',
        data: $('#update-char').serialize(),
        success: function (result) {
            window.location.replace("./");
        }
    })
};