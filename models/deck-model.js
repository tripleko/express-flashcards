const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
    cardType: String,
    front: String,
    back: String,
    //0 indicates there is no time limit.
    timeLimit: Number,
    currentInterval: Number,
    bestInterval: Number,
    //The most recent time I studied a card, in milliseconds since epoch.
    recentStudiedTime: Number,
    /* Total times practiced. Useful for tracking the first three intervals.
    Maybe other uses in the future. */
    numPracticed: Number,
    //Total times correct. Useful for checking if the first three intervals were correct.
    numCorrect: Number
});

const DeckSchema = new Schema({
    deckName: String,
    //deckOrder: Number,
    cards: [CardSchema],
    lastStudied: Number
    //cardCount: Number
});

const Deck = mongoose.model('deck', DeckSchema);

module.exports = Deck;