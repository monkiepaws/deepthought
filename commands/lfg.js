// TODO:
// 1. Alias for Tekken as "t7"
// 2. Add SC6 Game
// 3. Don't overwrite platform if you update?
// 4. Add SF5 Alias
// 5. Add SF4 Alias
// 6. Add FC/30th platforms for ST/3S OR
// 7. Add Fightcade as a Game

const description = "Let people know which games you are available for!\n" +
                    "**Games**\n" +
                    "sfv        Street Fighter V\n" +
                    "st         Super Street Fighter II Turbo\n" +
                    "3s         3rd Strike\n" +
                    "usf4       Ultra Street Fighter IV\n" +
                    "dbz        Dragonball FighterZ\n" +
                    "gg         Guilty Gear Xrd Rev2\n" +
                    "unist      The other ST\n" +
                    "mhw        Monster Hunter World\n" +
                    "tekken     ...Tekken 7\n" +
                    "mvci       Marvel vs Capcom: Infinite\n\n" +
                    "**stop**       Remove yourself from the waiting list (**!lfg stop**)\n\n" +
                    "__Platforms__  Only pc and ps4 are accepted. Anything else will default to pc\n\n" +
                    "Example for wanting DBZ games for the next 2 hours on PS4:\n" +
                    "**!lfg dbz 2 ps4**\n";
const validPlatforms = ["pc", "ps4"];
const defaultPlatform = "pc";
const gameList = ["all", "sfv", "st", "3s", "usf4", "dbz", "gg", "unist", "mhw", "tekken", "mvci"];
const allGames = gameList[0];
const MAX_HOURS = 24;

const lfgList = [];

module.exports = {
    name: "lfg",
    usage: "[name of game] [hours] [optional: platform]",
    aliases: ["game", "games", "waiting", "available"],
    description: description,
    cooldown: 2,
    execute(message, args) {
        // !lfg
        // Without arguments, we show the current list of users waiting for games
        if (args.length === 0) {
            showList(message);
            return;
        }

        // If the first argument is stop - delete user from the waiting list
        if (args[0] === "stop") {
            if (removeFromListByID(message.author.id) === true) {
                message.channel.send(`${message.author}, if you were on the waiting list, I've removed you!`);
            } else {
                message.channel.send(`${message.author}, I don't think you were on the waiting list!`);
            }

            return;
        }

        const game = args[0];
        const isValidGame = containsUserGame(game);

        if (isValidGame === false) {
            return message.channel.send(`${message.author}, you haven't provided a valid game or sub-command. Type **!help lfg** for more info.`);
        }

        // If the second argument is NaN:
        // 1. User wants a list specific for the game requested OR
        // 2. Invalid argument
        if (isNaN(args[1])) {
            if (isValidGame === true) {
                showList(message, game);
                return;
            } else {
                return message.channel.send(`${message.author}, I didn't understand what you wanted. Try !lfg [name of game] [hours]`);
            }
        }

        // Does this user + game combination already exist? Delete the old one
        removeDuplicateLFG(message.author.id, game);

        // Everything seems OK, ready to add user to the waiting list
        if (args[1] > MAX_HOURS) {
            args[1] = MAX_HOURS;
        }
        const availableTime = args[1] * 1000 * 60 * 60;
        const availableUntil = Date.now() + availableTime; 

        const platform = isValidPlatform(args[2]) ? args[2] : defaultPlatform;

        const newLFG = {
            userID: message.author.id,
            username: message.author.username,
            game: game,
            platform: platform,
            endTime: availableUntil
        }

        lfgList.push(newLFG);
        message.channel.send(`${message.author}, added you to the ${newLFG.game.toUpperCase()} waiting list!`);
        return;
    }
};

const showList = (message, game = allGames) => {
    let listMessage = "**__Games Available:__**\n";
    let lfgListCounter = 0;

    if (!lfgList.length) {
        listMessage += "No users waiting for games, at the moment! Don't forget to add yourself, post **!help lfg** to see how!";
    }
    
    for (let i = 0; i < lfgList.length; i++) {
        if (removeExpiredLFG(i) === true) {
            i--;
        } else {
            if (game === lfgList[i].game || game === allGames) {
                lfgListCounter++;
                listMessage += createListText(i, lfgListCounter);
            }
        }       
    }
    console.log(lfgList);

    message.channel.send(listMessage);

    return;
};

const removeExpiredLFG = i => {
    if (lfgList[i].hasOwnProperty("endTime")) {
        if (Date.now() >= lfgList[i].endTime) {
            lfgList.splice(i, 1);
            return true;
        }
    }
    return false;
};

const createListText = (i, count) => {
    const username = lfgList[i].username;
    const game = lfgList[i].game.toUpperCase();
    const platform = lfgList[i].platform.toUpperCase();
    let endTime = (lfgList[i].endTime - Date.now()) / 1000 / 60;

    if (endTime < 60) {
        return `**${count}. ${username}:** waiting for **${game}** on **${platform}** for ${Math.floor(endTime)} more minutes.\n`;
    } else {
        endTime /= 60;
        return `**${count}. ${username}:** waiting for **${game}** on **${platform}** for ${Math.floor(endTime)} more hours.\n`
    }
};

const removeFromListByID = id => {
    let didRemoveLFG = false;

    for (let i = 0; i < lfgList.length; i++) {
        if (lfgList[i].hasOwnProperty("userID")) {
            if (lfgList[i].userID === id) {
                lfgList.splice(i, 1);
                i--;
                didRemoveLFG = true;
            }
        }
    }

    return didRemoveLFG;
}

const containsUserGame = userGame => gameList.some(game => userGame === game);

const isValidPlatform = platform => validPlatforms.some(pf => platform === pf);

const removeDuplicateLFG = (id, game) => {
    for (let i = 0; i < lfgList.length; i++) {
        if (lfgList[i].hasOwnProperty("userID") && lfgList[i].hasOwnProperty("game")) {
            if (lfgList[i].userID === id && lfgList[i].game === game) {
                lfgList.splice(i, 1);
                i--;
            }
        }
    }

    return;
};