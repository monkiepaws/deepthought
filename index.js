const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require("./auth.json");

client.on("ready", () => {
    console.log("Ready!");
});

client.login(auth.token);