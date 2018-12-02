const colors = require('colors');
const RoleSub = require('./RoleSub/RoleSub');

const description = '';
const MANAGE_ROLES = 'MANAGE_ROLES';
const sub = new RoleSub();

module.exports = {
    name: 'sub',
    usage: '[game name] [hours] [optional: platform]',
    aliases: ['g', 'lfg'],
    description: description,
    cooldown: 3,
    execute(message, args) {
        if (args.includes('list')) {
            return showList(message);
        }
        if (args.includes('add')) {
            return tryAddRole(message, args);
        }
    }
};

function showList(message) {
    const result = sub.list(message);
    // turn into resolve of promise
    console.log(result);
    if (result.length) {
        const reply = prettify(message, result, 'Valid roles');
        return message.channel.send(reply);
    } else {
        return message.channel.send(`${message.author}, no roles to show on this server`);
    }
}

function prettify(message, list, title) {
    let result = `__${title}__\n`;
    list.forEach(item => {
        result += `${item}\n`
    });
}

function tryAddRole(message, args) {
    const name = message.member.displayName || message.author.name;

    if (message.member.hasPermission(MANAGE_ROLES)) {
        console.log(`${name} has permission: ${MANAGE_ROLES}`.green);
        const roleArgs = args.filter(word => word !== 'add');
        return sub.addRole(message, roleArgs)
            .then(result => {
                console.log('\nLet\'s print what happened'.magenta);
                console.log(result);
            })
            .catch(console.error);
    } else {
        console.log(`${name} does not have permission: ${MANAGE_ROLES}`.red);
        return message.channel.send(`${message.author}, you don't have permission!`);
    }
}

