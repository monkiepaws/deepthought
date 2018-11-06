const sql = require('mssql');
const getConnection = require('./getConnection.js');
module.exports = stopBeaconsByUser;

async function stopBeaconsByUser(userId) {
    try {
        const pool = await getConnection();
        const request = await new sql.Request(pool);
        return request.input(`UserId`, sql.NVarChar, userId)
            .execute(`spBeacon_Update_StopAll`);
    } catch (err) {
        console.log(err);
    }
}