const md5 = require('md5');
const random = require('random');

class ChallengeManager {
    constructor(config) {
        this.challenges = {}; // Map of IP -> generated challeges
        this.powDifficulty = config.powDifficulty; // Number of zeros required to be in the hash
        this.key = config.accessKey + config.version; // constant string used to generate hash
    }
    generateChallengeFromRequest(req) {
        const ip = req.ip;
        const randInt = random.int(1, 999999);
        this.challenges[ip] = randInt.toString();
        return this.challenges[ip];
    }
    testSolutionForIP(solution, ip) {
        const challenge = this.challenges[ip];
        if (!challenge) {
            return false;
        }
        const hash = md5(this.key + challenge + solution);
        const hashStr = hash.substring(0, this.powDifficulty);
        return hashStr === Array(this.powDifficulty + 1).join('0');
    }
}

module.exports = ChallengeManager;