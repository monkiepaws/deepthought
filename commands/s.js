const stop = require('./games.js');
const name = 's';
const description = `!${name} is a shortcut for the \`!games stop\` command`;

module.exports = {
    name: name,
    usage: '[no arguments]',
    aliases: ['stop'],
    description: description,
    cooldown: 3,
    execute(message, args) {
        return stop.removeFromList(message);
    }
};