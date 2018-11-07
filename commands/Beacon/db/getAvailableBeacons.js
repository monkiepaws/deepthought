const sql = require('mssql');
module.exports = getAvailableBeacons;

async function getAvailableBeacons() {
    try {
        const pool = await getConnection();
        const request = await new sql.Request(pool);
        return request.execute(`spGetAllAvailableBeacons`);
    } catch (err) {
        console.log(err);
    }
}