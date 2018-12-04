const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const regex = /^[\w\-\ \!\.]+$/g;

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();


client.on("ready", () => {
    console.log("Ready!");
});

client.login(token)
    .then(response => {
        if (response !== token) {
            throw new Error('Couldn\'t login to discord, or response token is differs to sent token.');
        }
    })
    .catch(err => console.error(err));

client.on("message", message => {
    // If the message meets one of these three conditions, do nothing :
    // 1. Message doesn't start with the prefix
    // 2. The Message author is a bot
    // 3. The Message was sent through a DM
    if (message.content.startsWith(prefix) === false || message.author.bot === true || message.channel.type === 'dm') {
        return;
    }

    // 4. The Message contains disallowed characters
    if (!message.content.match(regex)) {
        return;
    }

    // Split message of all spaces
    const args = message.content.toLowerCase().slice(prefix.length).split(/ +/);
    // Remove first word from the message as the command
    const commandName = args.shift().toLowerCase();

    // Set the command name provided by the user, OR by using an alias
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    // If not a valid command, return
    if (!command) return;

    // If the command doesn't have the right number of arguments...
    if (command.args && !args.length) {
        let reply = `Whoah, there! You need to provide some arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage is: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // Set cooldowns
    if (cooldowns.has(command.name) === false) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Add the user to the cooldown list if not already there, and set a timer to delete them
    if (timestamps.has(message.author.id) === false) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    // Otherwise, check if they meet the criteria (for that command) for activating a cooldown timer
    } else {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    // Execute the command
    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply("oh no! Something happened. It wasn't good ~~!");
    }
});