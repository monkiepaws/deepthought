// TODO:
// 1. Don't overwrite platform if you update? < done
// 2. Special case for SFV where doesn't show platform
// 3. Add by-platform list
// 4. Hours AND Minutes
// 5. Order lists by Platform > Game > Time
// 6. Ping everyone on game list when another is added < done
//      6.a Mention user once
//      6.b Game specific messages
// 7. Justify List text with magic algorithm

const Beacon = require('./Beacon/Beacon.js');
function initGames() {
    const { games } = require("./gamesdata/games.json");
    return games;
}
function initAliases() {
    const { aliases } = require("./gamesdata/aliases.json");
    return aliases;
}
const games = new Map(Object.entries(initGames()));
const aliases = new Map(Object.entries(initAliases()));
const gamesList = embeddedGamesList();
const beacon = new Beacon();
const MIN_HOURS = 0.25;
const MAX_HOURS = 24;
const description = "Let people know which games you are available for!\n" +
    "Say you've come home from work or school and want to play some SFV, but " +
    "don't want to watch the match making channel all night? Just use your " +
    "friendly **WP Looking For Games** service to send out a beacon!\n\n" +
    "__Example:__ Harry is available to play SSF2 Super Turbo on PS4 for the next " +
    "2.5 hours:\n" +
    "**wp!games\tst\t2.5\tps4**\n" +
    "...sends out a beacon. *Easy!*\n\n" +
    "__Take yourself off the list:__\n" +
    "**wp!games\tstop**\n\n" +
    "__Parameters:__\n" +
    "**[game name]:**\ttype\t**wp!games\tlist**\tfor a list of valid games.\n" +
    "**[hours]:**\tMin: 0.25 (15 mins) / Max: 24\n" +
    "**[platform]:**\tOptional. Defaults to PC. Type\t**wp!games\tlist**\tfor valid platforms\n";

module.exports = {
    name: "games",
    usage: "[game name] [hours] [optional: platform]",
    aliases: ["lfg"],
    description: description,
    cooldown: 2,
    execute(message, args) {
        // !lfg
        // Without arguments, we show the current list of users waiting for games
        if (args.length === 0) {
            return showList(message);
        }

        // This is the call for the list of games the bot accepts
        if (args[0] === "list") {
            return message.author.send({ embed: gamesList });
        }

        // If the first argument is stop - delete user from the waiting list
        if (args[0] === "stop") {
            return removeFromList(message);
        }

        const game = aliases.has(args[0]) ? aliases.get(args[0]).game : null;
        if (!game) {
            return message.channel.send(`${message.author}, ` +
            `you haven't provided a valid game or sub-command. Type **wp!help games** for more info.`);
        }
        const title = games.get(game).title;

        // If the second argument is NaN:
        //   User wants a list specific for the game requested
        if (isNaN(args[1])) {
            return showListOfGame(game, title, message);
        }

        const time = args[1] < MAX_HOURS ? args[1] : MAX_HOURS;
        const minutesAvailable = time > MIN_HOURS ? time * 60 : MIN_HOURS * 60;

        const platform = games.get(game).platforms.includes(args[2]) ? args[2] : games.get(game).defaultPlatform;

        // Everything seems OK, ready to add user's beacon to the waiting list
        const newBeacon = {
            userId: message.author.id,
            username: message.author.username,
            gameName: game,
            platformName: platform,
            minutesAvailable: minutesAvailable,
        };

        return addToList(newBeacon, message);
    },
};

function showList(message) {
    return beacon.getList()
        .then(list => message.channel.send(list))
        .catch(err => console.log(err));
}

function showListOfGame(game, title, message) {
    return beacon.showListOfGame(game, title)
        .then(list => message.channel.send(list))
        .catch(err => console.log(err));
}

function removeFromList(message) {
    return beacon.removeFromListByID(message.author.id.toString())
        .then(success => {
            if (success) {
                return message.channel.send(`${message.author}, if you were on the waiting list, I've removed you!`);
            } else {
                return message.channel.send(`${message.author}, I don't think you were on the waiting list!  🤔`);
            }
        })
        .catch(err => console.log(err));
}

function addToList(newBeacon, message) {
    return beacon.addBeacon(newBeacon)
        .then(result => messageOnAddBeacon(newBeacon.gameName, result, message))
        .catch(err => console.log(err));
}

function messageOnAddBeacon(game, result, message) {
    if (result.rowsAffected.every(value => value > 0)) {
        let success = `${message.author}, added you to the ${game.toUpperCase()} waiting list!\n**Here comes a new rival!**\t`;
        result.recordset.map(beacon => {
            success += `<@${beacon.UserId}>\t`;
        });
        return message.channel.send(success);
    } else {
        return message.channel.send(`${message.author}, something went wrong and you weren't added to a waiting list!`);
    }
}

function embeddedGamesList() {
    const fields = [];

    games.forEach((game, key, map) => {
        const name = `**${key.toUpperCase()}**\t${game.title}`;
        let value = '';
        game.platforms.forEach((platform, index) => {
            value += `${platform.toUpperCase()}`;
            if (game.platforms.length - 1 === index) {
              value += '.';
            } else {
              value += ', ';
            }
        });
        const field = {
            name: name,
            value: value
        };
        fields.push(field);
    });

    return {
        color: 0xff4992,
        title: `List of valid games and platforms`,
        author: {
            name: `WP Looking For Games`
        },
        description: ``,
        fields: fields
    };
}