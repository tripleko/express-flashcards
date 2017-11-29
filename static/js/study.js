hljs.initHighlightingOnLoad();

function postStudyData() {
    $.post({
        url: '/study/' + deckID,
        data: {
            cardID: cardID,
            currentInterval: currentInterval,
            bestInterval: bestInterval,
            recentStudiedTime: Date.now(),
            numPracticed: numPracticed,
            numCorrect: numCorrect
        },
        success: (val) => {
            console.log(val);
            if (val === "submitted") {
                location.reload();
            }
        },
        dataType: 'text'
    });
}

//Moved to here for now because of memory usage over time that bugged me on the profiler.
let minutes, seconds, secStr, minStr;
function msToReadableCountdown(milliseconds) {
    if (milliseconds >= 0) {
        minutes = Math.floor(milliseconds / 60000);
        seconds = Math.abs(Math.floor(milliseconds % 60000 / 1000));
    } else {
        minutes = Math.ceil(milliseconds / 60000);
        seconds = Math.abs(Math.floor(milliseconds % 60000 / 1000));
    }

    if (seconds < 10) {
        secStr = "0" + seconds.toString();
    } else {
        secStr = seconds.toString();
    }
    if (minutes < 10 && minutes > -10) {
        if (milliseconds > 0) {
            minStr = "0" + minutes.toString();
        } else {
            minStr = "-0" + Math.abs(minutes).toString();
        }
    } else {
        minStr = minutes.toString();
    }

    return minStr + ":" + secStr;
}

$(document).ready(function () {
    let startTime = Date.now();

    let setRed = false;
    let timerReID = setInterval(() => {
        $("#timeDisplay")
            .text(msToReadableCountdown(timeLimit - Date.now() + startTime));
        if(setRed || (timeLimit - Date.now() + startTime) < 0) {
            $("#timeDisplay").css("color", "red");
            setRed = true;
        }
    }, 200);

    //boolean to prevent case where use submits multiple requests and the card is incremented/
    //decremented multiple times
    let unchanged = true;

    $("#showAnsBtn").click(function () {
        $("#ansDiv").show();
        $("#showAnsBtn").hide();
        clearInterval(timerReID);
    });

    $("#correctBtn").click(function () {
        if (unchanged) {
            //User repeats interval 0 at least three times no matter what, but getting all three
            //initial tries correct allows the user to skip to interval 2.
            if (numPracticed === 2 && numCorrect === 2) {
                currentInterval = 2;
            } else if (numPracticed >= 2) {
                currentInterval += 1;
            }

            if (currentInterval > bestInterval) {
                bestInterval = currentInterval;
            }

            numPracticed += 1;
            numCorrect += 1;
            unchanged = false;
        }

        postStudyData()
    });
    $("#incorrectBtn").click(function () {
        if (unchanged) {
            currentInterval = 0;

            numPracticed += 1;
            unchanged = false;
        }

        postStudyData()
    });
});