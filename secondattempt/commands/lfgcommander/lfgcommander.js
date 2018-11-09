const gameList = require("../lfgdata/games.json");
const defaultPlatform = "pc";
const MAX_HOURS = 24;

class Lfg {
    constructor(game = "none", time = 0, platform = defaultPlatform) {
        this._game = game;
        this._timeAvailable = this.calculateTimeAvailable(time);
        this._platform = platform;
    }

    set game(gameName) {
        this._game = gameName;
    }

    set timeAvailable(time) {
        this._timeAvailable = this.calculateTimeAvailable(time);
    }

    calculateTimeAvailable(time) {
        const remainingTime = time * 1000 * 60 * 60;
        return Date.now() + remainingTime;
    }
}

// function lfgcommand(args) {
module.exports = {
    lfgcommand: function(args) {
        // const newLFG = new Lfg();
        let result = [];

        args.forEach(argument => {
            let todo = gameList.find(game => game.name === argument);
            let parsed = JSON.parse(todo);
            gameName = parsed.name;

            // if (gameName === undefined) {
            //     gameName = gameList.find(game => game.aliases.find(alias => alias === argument) === argument);
            // }
        //
        //     // if (gameName !== undefined) {
        //     //     newLFG.game = gameName;
        //     //     return;
        //     // }
        //
        //     // if (Number.isNan(Number.parseFloat(argument)) === false) {
        //     //     newLFG.timeAvailable = argument;
        //     // }
        //
            result.push(gameName);
        });

        return result;
    }
}