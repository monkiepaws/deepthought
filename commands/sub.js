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
            showList(message);
            return;
        }
        if (args.includes('add')) {
            return tryAddRole(message, args);
        }
    }
};

function showList(message) {
    return sub.list(message)
        .then(result => {
            if (result.length) {
                const reply = prettify(message, result, 'Valid roles');
                message.channel.send(`${reply}`);
            } else {
                return message.channel.send(`${message.author}, no roles to show on this server`);
            }
        });
}

function prettify(message, list, title) {
    let result = `__${title}__\n`;
    list.forEach(item => {
        result += `${item.role['name']}\n`
    });
    return result;
}

function tryAddRole(message, args) {
    const name = message.member.displayName || message.author.name;

    if (message.member.hasPermission(MANAGE_ROLES)) {
        console.log(`${name} has permission: ${MANAGE_ROLES}`.green);
        const roleArgs = args.filter(word => word !== 'add');
        return sub.addRole(message, roleArgs)
            .then(result => {
                console.log('\nLet\'s print what happened'.magenta);
                if (result.response.added.length) {
                    console.log(`Added: ${result.response.added.join(', ')}`);
                }
                if (result.response.exists.length) {
                    console.log(`Already exists: ${result.response.exists.join(', ')}`);
                }
                if (result.invalidRoles.length) {
                    console.log(`Roles that don't exist: ${result.invalidRoles.join(', ')}`);
                }
             })
            .catch(console.error);
    } else {
        console.log(`${name} does not have permission: ${MANAGE_ROLES}`.red);
        return message.channel.send(`${message.author}, you don't have permission!`);
    }
}

