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
            url: '/editcard/' + deckID + '/' + cardID,
            data: {
                front: frontCode.getValue(),
                back: backCode.getValue(),
                timeLimit: $("#timeLimitInput").val(),
                cardType: $("#cardTypeSelect").val(),
                currentInterval: $("#currentInterval").val(),
                bestInterval: $("#bestInterval").val(),
                recentStudiedTime: $("#recentStudiedTime").val(),
                numPracticed: $("#numPracticed").val(),
                numCorrect: $("#numCorrect").val()
            },
            success: (val) => {
                console.log(val);
                if(val === "edited") {
                    window.location.href = "/cardlist/" + deckID;
                }
                //redirect to deck home
                //location.reload();
            },
            dataType: 'text'
        });
    });
});