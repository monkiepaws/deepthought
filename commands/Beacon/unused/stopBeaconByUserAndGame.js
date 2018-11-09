const sql = require('mssql');
const getConnection = require('./getConnection.js');
module.exports = stopBeaconByUserAndGame;

async function stopBeaconByUserAndGame(userId, gameName) {
    try {
        const pool = await getConnection();
        const request = await new sql.Request(pool);
        return request.input(`UserId`, sql.NVarChar, userId)
            .input(`GameName`, sql.NVarChar, gameName)
            .execute(`spBeacon_Update_StopGame`);
    } catch (err) {
        console.log(err);
    }
}