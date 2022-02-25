const { spawn } = require('child_process');
const EventEmitter = require('events').EventEmitter;

class Game extends EventEmitter {
    constructor(options, req) {
        super();

        // set metadata
        const body = req.body;
        this.meta = {
            name: body.name,
            host: body.host,
            timestamp: Date.now(),
            players: 0,
            locked: false
        }
        this.ip = req.ip;

        this.port = null;
        // launch the game process and handle output and exit events
        this.process = spawn(options.command, options.args, { cwd: options.dir });
        this.process.stdout.on('data', this._handleOutput);
        this.process.stderr.on('data', this._handleError);
        this.process.on('exit', this._handleExit);
    }
    _handleOutput(data) {
        const str = data.toString().trim();
        const self = this;
        if (this.port === null) {
            // set port if not set
            this.port = str;
            this.emit('port', str);
        } else {
            // listen for events and logs
            console.log(`(${this.port}): ${str}`);
        }
    }
    _handleError(data) {
        console.error(`(${this.port}): ${data.toString()}`);
    }
    _handleExit(code, signal) {
        this.emit('exit', this.port);
        console.log(`(${this.port}): exited with code ${code} signal ${signal}`);
    }
}

module.exports = Game;