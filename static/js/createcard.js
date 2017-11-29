let frontCode = CodeMirror.fromTextArea(document.getElementById("frontCode"), {
    mode: {
        name: "gfm",
        tokenTypeOverrides: {
            emoji: "emoji"
        }
    },
    theme: "monokai",
    lineNumbers: true,
    lineWrapping: true
});

let backCode = CodeMirror.fromTextArea(document.getElementById("backCode"), {
    mode: {
        name: "gfm",
        tokenTypeOverrides: {
            emoji: "emoji"
        }
    },
    theme: "monokai",
    lineNumbers: true,
    lineWrapping: true
});

$(document).ready(function () {
    $("#saveBtn").click(function () {
        $.post({
            url: '/createcard/' + deckID,
            data: {
                front: frontCode.getValue(),
                back: backCode.getValue(),
                timeLimit: $("#timeLimitInput").val(),
                cardType: $("#cardTypeSelect").val()
            },
            success: (val) => {
                console.log(val);
                window.location.href = "/cardlist/" + deckID;
                //redirect to deck home
                //location.reload();
            },
            dataType: 'text'
        });
    });
});