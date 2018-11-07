// TODO:
// 1. Don't overwrite platform if you update?
// 2. Special case for SFV where doesn't show platform
// 3. Add by-platform list
// 4. Hours AND Minutes
// 5. Order lists by Platform > Game > Time
// 6. Ping everyone on game list when another is added

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
            beacon.showList()
                  .then(list => message.channel.send(list))
                  .catch(err => console.log(err));
            return;
        }

        if (args[0] === "list") {
            return message.author.send({ embed: gamesList });
        }

        // If the first argument is stop - delete user from the waiting list
        if (args[0] === "stop") {
            beacon.removeFromListByID(message.author.id.toString())
                .then(success => {
                    if (success) {
                        return message.channel.send(`${message.author}, if you were on the waiting list, I've removed you!`);
                    } else {
                        return message.channel.send(`${message.author}, I don't think you were on the waiting list!`);
                    }
                }).catch(err => {
                    console.log(err);
            });
            return;
        }

        const game = aliases.has(args[0]) ? aliases.get(args[0]).game : null;
        if (!game) return message.channel.send(`${message.author}, you haven't provided a valid game or sub-command. Type **wp!help games** for more info.`);

        // If the second argument is NaN:
        //   User wants a list specific for the game requested
        if (isNaN(args[1])) {
            beacon.showListOfGame(game, games.get(game).title)
                  .then(list => message.channel.send(list))
                  .catch(err => console.log(err));
            return;
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

        beacon.addBeacon(newBeacon)
            .then(success => {
                if (success) {
                    return message.channel.send(`${message.author}, added you to the ${newBeacon.gameName.toUpperCase()} waiting list!`);
                } else {
                    return message.channel.send(`${message.author}, something went wrong and you weren't added to a waiting list!`);
                }
            }).catch(err => {
                console.log(err);
        })
    },
};

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