const { RichEmbed } = require('discord.js');
const description = '';
const config = require('../config.json');

module.exports = {
    name: "where",
    usage: "no arguments",
    aliases: [],
    description: description,
    cooldown: 2,
    execute(message, args) {
        if (message.author.id === config.polyDiscordID) {
            const guilds = message.client.guilds.map(guild => guild['name']);
            const embed = new RichEmbed()
                .setColor('#00ff7b')
                .setTitle('I\'m at home in:')
                .setDescription(`${guilds.join('\n')}`);
            return message.channel.send(embed)
                .catch(console.error);
        } else {
            return;
        }
    }
};