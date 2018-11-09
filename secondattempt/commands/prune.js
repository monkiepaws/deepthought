const { polyDiscordID } = require("../config.json");

module.exports = {
    name: "prune",
    description: "Prune messages!",
    args: true,
    usage: "[amount]",
    execute(message, args) {
        const amount = args[0];

        if (isNaN(amount)) {
            return message.reply("that's not quite a number, is it?");

        } else if (amount < 2 || amount > 100) {
            return message.reply("you can prune the last 2 to 100 messages.");
        }

        if (message.author.id === polyDiscordID) {
            message.channel.bulkDelete(amount);
        }
        
        return;
    }
};