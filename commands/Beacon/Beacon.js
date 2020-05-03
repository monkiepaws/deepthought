// This class is the middle man between the bot and the data
// access layer (in this case, BeaconDb)
const BeaconDynamoDb = require('./db/BeaconDynamoDb');
const allGames = 'all games';

module.exports = class Beacon {
    constructor() {
        this._db = new BeaconDynamoDb();
    }

    async getList() {
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
        return result;
    }

    async removeFromListByID(userId) {
        let result;
        try {
            result = await this._db.stopBeaconsByUser(userId);
        } catch(err) {
            console.log(err);
        }
        return result;
    }

    messageList(listType, data) {
        if (!data.Count || data.Count === 0) {
            return `No one is waiting for ${listType.toUpperCase()}, yet!\nDon't forget to add yourself to the waiting list. Check out **!helpme games**`;
        }

        const title = listType === allGames ? 'All Available' : `All ${listType}`;
        let list = `WP Looking For Games\n${title} Beacons\n\n`;
        const date = new Date();

        data.Items.map((beacon, index) => {
            const { Username, GameName, PlatformName, EndTime } = beacon;
            const platform = PlatformName === 'pc'? '' : `\t(${PlatformName.toUpperCase()})`;
            const available = (EndTime - date.getTime()) / 60000;
            const hours = Math.floor(available / 60);
            const minutes = Math.floor(available % 60);
            const showHours = hours > 0 ? ` ${hours}` : ' ';

            list += `🏮`;
            list += `${GameName.toUpperCase()}`.padEnd(7);
            list += `${Username}`.padEnd(18).slice(0, 18);
            list += showHours === ' ' ? ''.padEnd(9) : `${showHours}${hours === 1 ? ` hour  ` : ` hours `}`.padEnd(8);
            list += `${minutes}${minutes === 1 ? ' min' : ' mins'}`.padEnd(7);
            list += `${platform}\n`.padStart(8);
        });
        return '`' + list + '`';
    }
};