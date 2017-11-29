require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Deck = require('./models/deck-model');

const showdown = require('showdown');
const highlightjs = require('highlight.js')

//Using tivie's snippet from: https://github.com/showdownjs/showdown/issues/215
showdown.extension('codehighlight', function () {
    function htmlunencode(text) {
        return (
            text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
        );
    }
    return [{
        type: 'output',
        filter: function (text, converter, options) {
            // use new shodown's regexp engine to conditionally parse codeblocks
            var left = '<pre><code\\b[^>]*>',
                right = '</code></pre>',
                flags = 'g',
                replacement = function (wholeMatch, match, left, right) {
                    // unescape match to prevent double escaping
                    match = htmlunencode(match);
                    return left + highlightjs.highlightAuto(match).value + right;
                };
            return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
        }
    }];
});
showdown.setFlavor('github')

sdConv = new showdown.Converter({
    extensions: ['codehighlight'],
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    openLinksInNewWindow: true
});

app.use(express.static('static'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
//app.set('x-powered-by', false);

mongoose.connect(process.env.MONGODB_URI, () => {
    console.log('connected to mongodb');
});

app.get('/', (req, res) => {
    Deck.find({}).then((decks) => {
        if (decks) {
            res.render('decklist', {
                data: decks
            });
        } else {
            res.render('decklist', {
                data: []
            });
        }
    });
});

app.post('/addDeck', (req, res) => {
    //console.log(req.body);

    Deck.findOne({
        deckName: req.body.deckName
    }).then((deckData) => {
        if (deckData) {
            res.send("deck already exists");
        } else {
            Deck({
                deckName: req.body.deckName,
                cards: [],
                lastStudied: 0
            }).save((err) => {
                if (err) throw err;

                res.send("added new deck");
            });
        }
    });
});

app.post('/deleteDeck', (req, res) => {
    //console.log(req.body);
    //res.send("do nothing");

    Deck.findByIdAndRemove(req.body.deckID, (err, deck) => {
        //console.log('here: ' + deck.id);
        res.send("deleted");
    });
});

app.get('/cardlist/:deckid', (req, res) => {
    //console.log(req.params.deckid);
    //res.render('cardlist');
    Deck.findById(req.params.deckid, (err, deckData) => {
        //console.log(deckData);
        if (deckData) {
            res.render('cardlist', {
                cardList: deckData.cards,
                deckName: deckData.deckName,
                deckID: deckData._id
            });
        } else {
            res.status(404).send("No such deck was found!");
        }
    });
});

app.get('/createcard/:deckid', (req, res) => {
    res.render('createcard', {
        deckID: req.params.deckid
    });
});

app.post('/createcard/:deckid', (req, res) => {
    Deck.findById(req.params.deckid, (err, deckData) => {
        if (deckData) {
            deckData.cards.push({
                cardType: req.body.cardType,
                front: req.body.front,
                back: req.body.back,
                timeLimit: parseInt(req.body.timeLimit),
                currentInterval: 0,
                bestInterval: 0,
                recentStudiedTime: 0,
                numPracticed: 0,
                numCorrect: 0
            });
            deckData.save(() => {
                res.send("FOUND DECK");
            });
        } else {
            res.status(404).send("No such deck was found!");
        }
    });
});

app.get('/editcard/:deckid/:cardid', (req, res) => {
    Deck.findById(req.params.deckid, (err, deckData) => {
        res.render("editcard", {
            deckID: req.params.deckid,
            cardID: req.params.cardid,
            cardData: deckData.cards.id(req.params.cardid)
        });
    });
    //Deck.findOne({"_id": req.params.deckid});
    //res.render("editcard", {deckID: req.params.deckid});
});

app.post('/editcard/:deckid/:cardid', (req, res) => {
    //console.log(req.body);
    //res.send("test");

    Deck.findById(req.params.deckid)
        .then((deckData) => {
            const cardData = deckData.cards.id(req.params.cardid);
            cardData.set({
                front: req.body.front,
                back: req.body.back,
                cardType: req.body.cardType,
                timeLimit: parseInt(req.body.timeLimit),
                currentInterval: parseInt(req.body.currentInterval),
                bestInterval: parseInt(req.body.bestInterval),
                recentStudiedTime: parseInt(req.body.recentStudiedTime),
                numPracticed: parseInt(req.body.numPracticed),
                numCorrect: parseInt(req.body.numCorrect)
            });

            return deckData.save();
        })
        .then((deckData) => {
            res.send("edited");
        })
        .catch(e => res.status(400).send(e));
});

app.post('/deleteCard', (req, res) => {
    //console.log(req.body)
    /*Deck.findById(req.body.deckID, (err, deck) => {
        //console.log('here: ' + deck.id);
        if (deck) {
            deck.cards
        }

        res.send("test");
    });*/

    Deck.findOneAndUpdate({
            "_id": req.body.deckID
        }, {
            "$pull": {
                "cards": {
                    _id: req.body.cardID
                }
            }
        }, {
            new: true
        },
        function (err, doc) {
            res.send("deleted");
        }
    );
});

//Helper functions to convert to epoch friendly time.
//They only run once or on error pages so they shouldn't impact performance much.
function daysToMS(days) {
    return Math.round(days * 86400000);
}

function minToMS(minutes) {
    return Math.round(minutes * 60000);
}

function msToReadable(millisec) {
    //I need the absolute value for the error pages.
    millisec = Math.abs(millisec);
    let seconds = (millisec / 1000).toFixed(1);
    let minutes = (millisec / (1000 * 60)).toFixed(1);
    let hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    let days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) {
        return seconds + " seconds";
    } else if (minutes < 60) {
        return minutes + " minutes";
    } else if (hours < 24) {
        return hours + " hours";
    } else {
        return days + " days"
    }
}

//Length of time to space a card for a given interval (in milliseconds).
let intervalLength = [
    minToMS(15),
    daysToMS(1),
    daysToMS(7),
    daysToMS(28),
    daysToMS(56),
    daysToMS(90),
    daysToMS(180),
    daysToMS(360),
    daysToMS(600),
    daysToMS(900),
    daysToMS(1200)
];

app.get('/study/:deckid', (req, res) => {
    Deck.findById(req.params.deckid, (err, deckData) => {
        if (deckData) {
            if (deckData.cards.length > 0) {
                let max_idx = -1;
                //Find the card with the greatest amount of time elapsed that is on schedule to be reviewed.
                let max_elapsed = -1;
                //Number is only relevant when displaying error page.
                //It's the time left till a card is available for studying.
                let error_elapsed = -8007199254740991;
                for (let i = 0; i < deckData.cards.length; i++) {
                    let tempC = deckData.cards[i];
                    let elapsed;
                    if (tempC.recentStudiedTime > 0) {
                        elapsed = Date.now() -
                            intervalLength[tempC.currentInterval] -
                            tempC.recentStudiedTime;
                    } else {
                        elapsed = 0;
                    }
                    if (elapsed > max_elapsed) {
                        max_idx = i;
                        max_elapsed = elapsed;
                    }
                    if (elapsed > error_elapsed) {
                        error_elapsed = elapsed;
                    }
                }

                if (max_idx === -1) {
                    let seconds = Math.round((error_elapsed / 1000) % 60);
                    res.render('studyerror', {
                        time_left: msToReadable(error_elapsed)
                    });
                } else {
                    //console.log(sdConv.makeHtml(deckData.cards[max_idx].front))
                    res.render("study", {

                        deckID: req.params.deckid,
                        card: deckData.cards[max_idx],
                        convFront: sdConv.makeHtml(deckData.cards[max_idx].front),
                        convBack: sdConv.makeHtml(deckData.cards[max_idx].back)
                    });
                }

            } else {
                res.send("No cards found in that deck!");
            }
        } else {
            res.status(404).send("No such deck was found!");
        }
    });

    //console.log(req.params.deck);
    //res.send('todo ' + req.params.deck);
});

app.post('/study/:deckid', (req, res) => {
    //console.log(req.params.deckid);
    //console.log(req.body);
    Deck.findById(req.params.deckid)
        .then((deckData) => {
            const cardData = deckData.cards.id(req.body.cardID);
            cardData.set({
                currentInterval: parseInt(req.body.currentInterval),
                bestInterval: parseInt(req.body.bestInterval),
                recentStudiedTime: parseInt(req.body.recentStudiedTime),
                numPracticed: parseInt(req.body.numPracticed),
                numCorrect: parseInt(req.body.numCorrect)
            });

            return deckData.save();
        })
        .then((deckData) => {
            res.send("submitted");
        })
        .catch(e => res.status(400).send(e));
});

app.listen(3000, () => {
    console.log('Now listening on port 3000.');
});
