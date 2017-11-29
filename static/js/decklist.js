function deleteDeck(deckID, deckName) {
    if (confirm('Are you sure you want to delete ' + deckName + '?')) {
        $.post({
            url: 'deleteDeck',
            data: {
                deckID: deckID
            },
            success: (val) => {
                console.log(val);
                if (val === 'deleted') {
                    location.reload();
                }
            },
            dataType: 'text'
        });
    }
}

function postNewDeck() {
    let deckName = $('#addNewTxt').val().trim();
    if (deckName) {
        $.post({
            url: 'addDeck',
            data: {
                deckName: deckName
            },
            success: (val) => {
                console.log(val);
                $('#addNewTxt').val('');
                if (val === 'added new deck') {
                    location.reload();
                }
            },
            dataType: 'text'
        });
    }
}

$(document).ready(function () {
    $("#addNewBtn").click(function () {
        postNewDeck();
    });

    $('#addNewTxt').keypress(function (e) {
        if (e.which == 13) {
            //$('form#login').submit();
            postNewDeck();
            return false;
        }
    });
});