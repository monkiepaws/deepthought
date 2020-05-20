// TODO:
// 3. Add by-platform list ~~ I'm observing performance of ordering all lists as:
//                  Platform > Game > Time available
const { RichEmbed } = require('discord.js');
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
const description = "Let people know which games you are available for!\n\n" +
    "__Example:__ Harry is available to play SSF2 Super Turbo on PS4 for the next " +
    "2.5 hours:\n" +
    "`!games st 2.5 ps4` ...sends out a beacon. *Easy!*\n\n" +
    "__Take yourself off the list:__\n" +
    "`!games stop`\n\n" +
    "__Parameters:__\n" +
    "`[game name]:`\ttype\t`!games list`\tfor a list of valid games.\n" +
    "`[hours]:`\tMin: 0.25 (15 mins) / Max: 24\n" +
    "`[platform]:`\tOptional. Defaults to PC. Type\t`!games list`\tfor valid platforms\n";

module.exports = {
    name: "games",
    usage: "[game name] [hours] [optional: platform]",
    aliases: ["g", "lfg"],
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
            return message.author.send({ embed: gamesList })
                .catch(error => console.log(error));
        }

        // If the first argument is stop - delete user from the waiting list
        if (args[0] === "stop") {
            return this.removeFromList(message);
        }

        // Check if the game is valid through the aliases Map
        const game = aliases.has(args[0]) ? aliases.get(args[0]).game : null;
        if (!game) {
            return message.channel.send(`${message.author}, ` +
            `you haven't provided a valid game or sub-command. Type **!helpme games** for more info.`)
                .catch(error => console.log(error));
        }
        const title = games.get(game).title;

        // If the second argument is NaN:
        //   User wants a list specific for the game requested
        if (isNaN(args[1])) {
            return showListOfGame(game, title, message);
        }

        // Check that the time available is valid
        const time = args[1] < MAX_HOURS ? args[1] : MAX_HOURS;
        const minutesAvailable = time > MIN_HOURS ? time * 60 : MIN_HOURS * 60;

        // Check that the platform is valid for this particular game in the games Map
        const platform = games.get(game).platforms.includes(args[2]) && game !== 'sfv' ?
            args[2]
            :
            games.get(game).defaultPlatform;

        // Everything seems OK, ready to add user's beacon to the waiting list
        const newBeacon = {
            userId: message.author.id,
            username: getUsername(message),
            gameName: game,
            platformName: platform,
            minutesAvailable: minutesAvailable,
        };

        return addToList(newBeacon, message);
    },

    removeFromList(message) {
        return beacon.removeFromListByID(message.author.id.toString())
            .then(responses => {
                if (responses.every(data => data)) {
                    const text = `${message.author} stopped waiting: **gl;hf!** 🎉`;
                    return message.channel.send(embeddedMessage(text));
                } else {
                    return message.channel.send(`${message.author}, I don't think you were on the waiting list!  🤔`);
                }
            })
            .catch(err => console.log(err));
    }
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

function addToList(newBeacon, message) {
    return beacon.addBeacon(newBeacon)
        .then(result => messageOnAddBeacon(newBeacon, result, message))
        .catch(err => console.log(err));
}

function messageOnAddBeacon(newBeacon, data, message) {
    if (data) {
        const game = newBeacon.gameName;
        const platformName = newBeacon.platformName;
        const platform = platformName === 'pc' ? '' : platformName.toUpperCase();
        const gameMessage = games.get(game).message;
        let mentions = '';
        let text = '';
        data.Items.map(currentBeacon => {
            if (currentBeacon.UserId !== message.author.id && currentBeacon.PlatformName === platformName) {
                mentions += `<@${currentBeacon.UserId}>\t`;
            }
        });
        text += `\n${message.author} added you to the ${game.toUpperCase()} ${platform} waiting list!`;
        message.channel.send(embeddedMessage(text))
        mentions += `**${gameMessage}**`;
        return message.channel.send(mentions);
    } else {
        return message.channel.send(`${message.author}, something went wrong and you weren't added to a waiting list!`);
    }
}

function getUsername(message) {
    if (message.member) {
        return message.member.displayName
    } else {
        return message.author.username
    }
}

function embeddedMessage(text) {
    return new RichEmbed()
        .setColor('#00ffb9')
        .setTitle(`🏮 Looking for games service`)
        .setDescription(text)
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
        color: 0x00ffb9,
        title: `List of valid games and platforms`,
        author: {
            name: `WP Looking For Games`
        },
        description: ``,
        fields: fields
    };
}