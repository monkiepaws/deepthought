const roles = require('./roles');

const description = '';
const MAX_ARGS = 5;

module.exports = {
    name: 'unsub',
    usage: '[role] [optional: up to 5 roles total]',
    aliases: [],
    description: description,
    cooldown: 3,
    execute(message, args) {
        unsubRoles(message, args.slice(0, MAX_ARGS));
    }
};

function unsubRoles(message, args) {
    return roles.allowedRoles(message)
        .then(response => response.filter(role => args.find(arg => arg === role['name'].toLowerCase())))
        .then(validRoles => validRoles.filter(role => message.member.roles.has(role['id']) === true))
        .then(rolesToUnsub => roles.request(message, rolesToUnsub, props()))
        .catch(console.error);
}

function props() {
    return {
        method: 'removeRoles',
        action: 'unsubbed',
        title: 'no roles to unsub',
        emoji: '\:broken_heart:'
    };
}