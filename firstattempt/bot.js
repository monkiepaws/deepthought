const Discord = require("discord.io");
const logger = require("winston");
const auth = require("./auth.json");
const request = require("request");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

// Initialise Discord bot
const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on("ready", event => {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(`${bot.username} - (${bot.id})`);
});

bot.on("message", (user, userID, channelID, message, event) => {
    if (message.substring(0, 1) == "!") {
        const arguments = message.substring(1).split(" ");
        let command = arguments[0];

        if (command === "results") {
            const tournament = arguments[1];
            getResults(tournament, channelID);
        }
    }
});

const getResults = (tournament, channel) => {
    const url = `https://${auth.user}:${auth.apiKey}@api.challonge.com/v1/tournaments/${tournament}/matches.json`;

    fetchTournament(url, winner => {
        printWinnerID(winner);

        fetchFinalMatch(winner, name => {
            printWinnerName(name);
            postWinnerMessage(tournament, name, channel);
        });
    });
};

const postWinnerMessage = (tournament, name, channel) => {
    const message = `The winner of the ${tournament} tournament was: ${name}`;
    bot.sendMessage({
        to: channel,
        message: message
    });
};

const printWinnerID = winner => {
    console.log(`printWinnerID: ${winner}`);
};

const fetchTournament = (url, callback) => {
    request(url, { json: true }, (error, response, body) => {
        if (error) {
            return console.log(error);
        }
        winnerId = body[body.length - 1].match.winner_id;
        console.log(`fetchTournament ${winnerId}`);

        callback(winnerId);
    });
};

const printWinnerName = name => {
    console.log(`printWinnerName: ${name}`);
};

const fetchFinalMatch = (winnerId, callback) => {
    const url = `https://${auth.user}:${auth.apiKey}@api.challonge.com/v1/tournaments/TEAMWP1/participants/${winnerId}.json`;

    request(url, { json: true }, (error, response, body) => {
        if (error) {
            return console.log(error);
        }
        const name = body.participant.display_name;

        console.log(`fetchWinnerName: ${name}`);
        callback(name);
    });
};