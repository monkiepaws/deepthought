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

let lfgCollection = [];

module.exports = {
    name: "lfg",
    usage: "[name of game] [hours] [optional: platform]",
    aliases: ["games", "waiting"],
    description: description,
    execute(message, args) {
        if (args.length === 0) {
            for (let i = 0; i < lfgCollection.length; i++) {
                if (lfgCollection[i].hasOwnProperty("endTime")) {
                    if (Date.now() >= lfgCollection[i].endTime) {
                        lfgCollection.splice(i, 1);
                        i--;
                    }
                }
            }
            console.log(lfgCollection);
            return;
        }

        const game = args[0];
        const platform = args[2] || "pc";

        const availableTime = args[1] * 1000;
        const availableUntil = Date.now() + availableTime; 

        const newLFG = {
            userID: message.author.id,
            username: message.author.username,
            game: game,
            platform: platform,
            endTime: availableUntil
        }


        lfgCollection.push(newLFG);
        return;
    }
};