module.exports = {
    async allowedRoles(message) {
        try {
            if (await message.guild.available) {
                return await allowedRoles(message);
            }
        } catch(err) {
            console.error(err);
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