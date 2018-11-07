const BeaconDb = require('./db/BeaconDb.js');
const allGames = 'all';

module.exports = class Beacon {
    constructor() {
        this._db = new BeaconDb();
    }

    async showList() {
        let result;
        try {
            result = await this._db.getAvailableBeacons();
        } catch(err) {
            console.log(err);
        }
        return this.messageList(allGames, result);
    }

    async showListOfGame(game, title) {
        let result;
        try {
            result = await this._db.getBeaconsByGame(game);
        } catch(err) {
            console.log(err);
        }
        return this.messageList(title, result);
    }

    async addBeacon(newBeacon) {
        const { userId, username, gameName, platformName, minutesAvailable } = newBeacon;
        let result;
        try {
            result = await this._db.sendBeacon(userId, username, gameName, platformName, minutesAvailable);
        } catch (err) {
            console.log(err);
        }
        return result.rowsAffected.every(value => value > 0);
    }

    async removeFromListByID(userId) {
        let result;
        try {
            result = await this._db.stopBeaconsByUser(userId);
        } catch(err) {
            console.log(err);
        }
        return result.rowsAffected.every(value => value > 0);
    }

    messageList(listType, result) {
        if (result.rowsAffected.every(value => value === 0)) {
            return `No one is waiting for ${listType.toUpperCase()}, yet!\nDon't forget to add yourself to the waiting list. Check out wp!games help`;
        }

        const title = listType === allGames ? 'All Available' : `All ${listType}`;
        let list = `**WP Looking For Games**\n__${title} Beacons__\n\n`;
        const date = new Date();

        result.recordset.map((beacon, index) => {
            const { Username, GameName, PlatformName, EndTime } = beacon;
            const platform = PlatformName === 'pc' ? `` : `\t(${PlatformName.toUpperCase()})`;
            const available = (EndTime - date.getTime()) / 60000;
            const time = available < 60 ? available : available / 60;
            const handle = available < 60 ? `minutes` : `hours`;
            list += `**${Username}**\tfor ${Math.round(time)} ${handle}\t***${GameName.toUpperCase()}***${platform}\n`
        });
        return list;
    }
};