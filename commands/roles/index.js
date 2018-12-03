module.exports = {
    async allowedRoles(message) {
        try {
            if (await message.guild.available) {
                const guildRoles = message.guild.roles;
                const allowed = compareRoles(message, await guildRoles);
            }
        } catch(err) {
            console.error(err);
        }
    }
};

function compareRoles(message, guildRoles) {
    const myPosition = getMyPosition(message);
}

async function getMyPosition(message) {
    const myRoles = message.guild.me.roles
        .sort((a, b) => b['position'] - a['position']);
    const myHighestRole = await myRoles.first(1);
    const myPosition = myHighestRole[0]['position'];
    return myPosition;
}