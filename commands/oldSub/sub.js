const colors = require('colors');
const RoleSub = require('./RoleSub/RoleSub');
const { Collection } = require('discord.js');

const description = '';
const MANAGE_ROLES = 'MANAGE_ROLES';
const ADD = 'ADD';
const DELETE = 'DELETE';
const sub = new RoleSub();

module.exports = {
    name: 'sub',
    usage: '[task] [role] [optional: multiple roles]',
    aliases: [],
    description: description,
    cooldown: 3,
    execute(message, args) {
        if (args.includes('list')) {
            return showList(message);
        }
        if (args.includes('add')) {
            return updateRoles(ADD, message, args);
        }
        if (args.includes('delete')) {
            return updateRoles(DELETE, message, args);
        }

        return subRoles(message, args);
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
        if (item.role) {
            result += `${item.role['name']}\n`;
        }
    });
    return result;
}

function updateRoles(task, message, args) {
    const name = message.member.displayName || message.author.name;

    if (message.member.hasPermission(MANAGE_ROLES)) {
        console.log(`\n${name} has permission: ${MANAGE_ROLES}`.green);
        console.log(`Let's print what happened, ${name}`.magenta);
        const roleArgs = args.filter(word => word !== task.toLowerCase());
        switch(task) {
            case ADD:
                return tryAddRoles(task, message, roleArgs);
            case DELETE:
                return tryDeleteRoles(task, message, roleArgs);
            default:
                return;
        }
    } else {
        console.log(`${name} does not have permission: ${MANAGE_ROLES}`.red);
        return message.channel.send(`${message.author}, you don't have permission!`);
    }
}

function tryAddRoles(task, message, roleArgs) {
    return sub.updateRoles(task, message, roleArgs)
        .then(result => {
            if (result.response) {
                if (result.response.added && result.response.added.length) {
                    console.log(`Added: ${result.response.added.join(', ')}`);
                }
                if (result.response.existing && result.response.existing.length) {
                    console.log(`Already exists: ${result.response.existing.join(', ')}`);
                }
            }
            if (result.invalidRoles && result.invalidRoles.length) {
                console.log(`Roles that don't exist: ${result.invalidRoles.join(', ')}`);
            }
        })
        .catch(console.error);
}

function tryDeleteRoles(task, message, roleArgs) {
    return sub.updateRoles(task, message, roleArgs)
        .then(result => {
            if (result.response) {
                if (result.response.deleted && result.response.deleted.length) {
                    console.log(`Deleted: ${result.response.deleted.join(', ')}`);
                }
                if (result.response.nonexistent && result.response.nonexistent.length) {
                    console.log(`Not on list: ${result.response.nonexistent.join(', ')}`);
                }
            }
            if (result.invalidRoles && result.invalidRoles.length) {
                console.log(`Roles that don't exist: ${result.invalidRoles.join(', ')}`);
            }
        })
        .catch(console.error);
}

function subRoles(message, args) {
    const name = message.member.displayName || message.author.name;
    sub.list(message)
        .then(result => {
            const roleIds = [];
            const roleNames = args.filter(arg => result.find(item => {
                if (item.role && item.role['name'] === arg) {
                    return roleIds.push(item.roleId);
                }
            }));
            return roleIds;
        })
        .then(result => {
            return message.member.addRoles(result);
        })
        .then(result => console.log(result))
        .catch(console.error);
}