const sql = require('mssql');
const getConnection = require('./getConnection.js');
module.exports = sendBeacon;

async function sendBeacon(userId, username, gameName, platformName, minutesAvailable) {
    try {
        const pool = await getConnection();
        const request = await new sql.Request(pool);
        return request.input(`UserId`, sql.NVarChar, userId)
                      .input(`Username`, sql.NVarChar, username)
                      .input(`GameName`, sql.NVarChar, gameName)
                      .input(`PlatformName`, sql.NVarChar, platformName)
                      .input(`MinutesAvailable`, sql.Int, minutesAvailable)
                      .execute(`spBeacon_Insert`);
    } catch (err) {
        console.log(err);
    }
}