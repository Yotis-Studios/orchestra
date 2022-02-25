const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

const challengeManager = require('./pow/ChallengeManager')(config);
const gameManager = require('./game/GameManager')(config, challengeManager);

const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));

// GET /version - returns the version of the game server
app.get('/version', (req, res) => {
    res.send(config.version);
});

// GET /games - returns games sorted by timestamp
app.get('/games', (req, res) => {
    const games = Object.keys(gameManager.games);
    const gameList = games.map((port) => {
        return games[port].meta;
    }).sort((a, b) => {
        return b.timestamp - a.timestamp;
    });
    res.send(gameList);
});

// POST /challenge - generates a challenge for the requesting IP
// returns challenge nonce as a string
app.post('/challenge', (req, res) => {
    const challenge = challengeManager.generateChallengeFromRequest(req);
    res.send(challenge);
});

// POST /games - attempts to start a new game
// returns port number of the new game
app.post('/games', (req, res) => {
    gameManager.requestGame(req, res);
});

app.listen(config.port, () => {
    console.log(`Orchestra launched on ${port}!`);
});