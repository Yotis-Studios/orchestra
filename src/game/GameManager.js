const Game = require('./Game');

class GameManager {
    constructor(config, challengeManager) {
        this.config = config;
        this.challengeManager = challengeManager;
        this.games = {};
    }

    requestGame(req, res) {
        // Check the request has a body
        if (!req.body) {
            res.status(400);
            res.send('Body required.');
            console.error(req.ip + " did not provide body");
            return;
        }
        // Check server capacity
        const numGames = Object.keys(games).length;
        if (numGames >= this.config.maxGames) {
            res.status(503);
            res.send('Server is at capacity. Please try again later.');
            console.error(req.ip + ' rejected. Out of system resources!');
            console.warn('Reached max number of games (' + maxGames + ')!');
            return;
        }
        // Check the user's proof of work before hosting new game
        const pow = req.body.pow;
        if (pow) {
            if (!this.challengeManager.testSolutionForIP(req.body.solution, req.ip)) {
                res.status(401);
                res.send('Invalid proof of work.');
                console.error(req.ip + " failed proof of work");
                return;
            }
        } else {
            res.status(417);
            res.send('Invalid request.');
            console.error(req.ip + " did not provide POW");
            return;
        }
        
        // Checks pass, let's start a game
        console.log(`Starting a game for ${req.ip} (${numGames+1}/${maxGames})`);
        const options = {
            command: this.config.spawnCommand,
            args: this.config.spawnArguments,
            dir: this.config.spawnDirectory
        };
        const newGame = new Game(options, req);
        newGame.on('port', (port) => {
            games[port] = newGame;
            res.send(port);
        });
        newGame.on('exit', (port) => {
            if (port !== '?') delete games[port];
        });
    }
}

module.exports = GameManager;