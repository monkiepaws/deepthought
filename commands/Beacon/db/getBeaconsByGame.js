const sql = require('mssql');
const getConnection = require('./getConnection.js');
module.exports = getBeaconsByGame;

async function getBeaconsByGame(gameName) {
    try {
        const pool = await getConnection();
        const request = await new sql.Request(pool);
        return request.input(`GameName`, sql.NVarChar, gameName)
                            .execute(`spGetAvailableBeaconsByGame`);
    } catch (err) {
        console.log(err);
    }
}