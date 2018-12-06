const Discord = require('discord.js');

module.exports = {
    async allowedRoles(message) {
        try {
            if (await message.guild.available) {
                return await allowedRoles(message);
            }
        } catch(err) {
            console.error(err);
        }
    },

    request(message, rolesToSub, props) {
        if (rolesToSub.size) {
            return message.member[props.method](rolesToSub)
                .then(() => reply(message, rolesToSub, props));
        } else {
            return message.channel.send(`${message.author}, ${props.title}`);
        }
    }
};

async function allowedRoles(message) {
    const myPosition = await getMyPosition(message);
    return message.guild.roles.filter(role => role.comparePositionTo(myPosition) < 0 && role['position'] !== 0);
}

async function getMyPosition(message) {
    const myRoles = message.guild.me.roles
        .sort((a, b) => b['position'] - a['position']);
    return await myRoles.first(1)[0];
}

function reply(message, rolesToUnsub, props) {
    return message.channel.send(changeMsg(message, rolesToUnsub, props));
}

function changeMsg(message, rolesAdded, props) {
    return new Discord.RichEmbed()
        .setColor('#ff0057')
        .setTitle(`**Role subs** ${props.emoji}`)
        .setDescription(`**${stringifyMapProp(rolesAdded, 'name')}**`)
        .addField(`were ${props.action} by`, `${message.author}`);
}

function stringifyMapProp(map, prop) {
    return map.map(element => element[prop])
        .join(', ');
}