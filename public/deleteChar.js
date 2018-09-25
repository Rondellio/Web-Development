// JavaScript source code
function deleteChar(id) {
    $.ajax({
        url: '/charBuild/' + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};

function deleteWeapon(id) {
    $.ajax({
        url: '/weapons/' + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};

function deleteArmor(id) {
    $.ajax({
        url: '/armor/' + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};

function deleteClass(id) {
    $.ajax({
        url: '/charClasses/' + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};

function deleteAbility(id) {
    $.ajax({
        url: '/abilities/' + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};

function deleteCharAbility(char_id, ability_id) {
    $.ajax({
        url: '/abilityChar/char_id/' + char_id + '/ability_id/' + ability_id,
        type: 'DELETE',
        success: function (result) {
            if (result.responseText != undefined) {
                alert(result.responseText)
            }
            else {
                window.location.reload(true)
            }
        }
    })
};