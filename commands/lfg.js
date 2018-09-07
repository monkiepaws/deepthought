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
                    "tekken     ...Tekken 7\n"
                    "mvci       Marvel vs Capcom: Infinite\n";
const validPlatforms = ["pc", "ps4"];
const defaultPlatform = "pc";

const lfgList = [];

module.exports = {
    name: "lfg",
    usage: "[name of game] [hours] [optional: platform]",
    aliases: ["game", "games", "waiting", "available"],
    description: description,
    execute(message, args) {
        // !lfg
        // Without arguments, we show the current list of users waiting for games
        if (args.length === 0) {
            showList(message);
            return;
        }

        const game = args[0];
        const platform = args[2] || defaultPlatform;

        const availableTime = args[1] * 1000;
        const availableUntil = Date.now() + availableTime; 

        const newLFG = {
            userID: message.author.id,
            username: message.author.username,
            game: game,
            platform: platform,
            endTime: availableUntil
        }


        lfgList.push(newLFG);
        return;
    }
};

const showList = message => {
    const removeExpiredLFG = i => {
        if (lfgList[i].hasOwnProperty("endTime")) {
            if (Date.now() >= lfgList[i].endTime) {
                lfgList.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    const createListText = i => {
        const username = lfgList[i].username;
        const game = lfgList[i].game;
        const platform = lfgList[i].platform;
        const endTime = Math.floor((lfgList[i].endTime - Date.now()) / 1000);

        const text = `**${i + 1}. ${username}:** waiting for **${game}** on **${platform}** for ${endTime} more seconds.\n`;

        return text;
    };

    let listMessage = "**__Games Available:__**\n";
    
    for (let i = 0; i < lfgList.length; i++) {
        if (removeExpiredLFG(i) === true) {
            i--;
        } else {
            listMessage += createListText(i);
        }       
    }
    console.log(lfgList);

    message.channel.send(listMessage);

    return;
}
