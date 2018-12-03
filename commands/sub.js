const roles = require('./roles');
const colors = require('colors');

const description = '';
const MAX_ARGS = 5;

module.exports = {
    name: 'sub',
    usage: '[list/role] [optional: up to 5 roles total]',
    aliases: [],
    description: description,
    cooldown: 3,
    execute(message, args) {
        if (args.includes('list')) {
            return sendList(message);
        }
    }
};

function sendList(message) {
    return roles.allowedRoles(message)
        .then(response => {
            console.log(response);
        });
}