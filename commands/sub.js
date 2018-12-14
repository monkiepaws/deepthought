const { RichEmbed } = require('discord.js');
const roles = require('./roles');

const description = '';
const MAX_ARGS = 5;

module.exports = {
    name: 'sub',
    usage: '[list/role] [optional: up to 5 roles total]',
    aliases: [],
    description: description,
    cooldown: 3,
    execute(message, args) {
        const newArgs = args.slice(0, MAX_ARGS);
        if (args.includes('list')) {
            return sendList(message);
        } else {
            return subRoles(message, newArgs);
        }
    }
};

function sendList(message) {
    return roles.allowedRoles(message)
        .then(response => response.map(role => role['name']))
        .then(roles => roles.join('\n'))
        .then(roles => message.channel.send(embeddedList(message, roles)))
        .catch(console.error);
}

function subRoles(message, args) {
    return roles.allowedRoles(message)
        .then(response => response.filter(role => args.find(arg => arg === role['name'].toLowerCase())))
        .then(validRoles => validRoles.filter(role => message.member.roles.has(role['id']) === false))
        .then(rolesToSub => roles.request(message, rolesToSub, props()))
        .catch(console.error);
}

function props() {
    return {
        method: 'addRoles',
        action: 'subbed',
        title: 'no roles to sub',
        emoji: '\:cupid:'
    };
}

function embeddedList(message, roles) {
    return new RichEmbed()
        .setColor('#ff0057')
        .setTitle('**Role subs list** \:heartpulse:')
        .setDescription(`**${roles}**`);
}