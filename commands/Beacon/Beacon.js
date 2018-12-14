// This class is the middle man between the bot and the data
// access layer (in this case, BeaconDb)
const BeaconDb = require('./db/BeaconDb.js');
const colors = require('colors');
const allGames = 'all games';
const SUCCESS = 0;

module.exports = class Beacon {
    constructor() {
        this._db = new BeaconDb();
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

    async addBeacon(beacons) {
        let promises = [];
        beacons.games.forEach(async (game, index) => {
            const beacon = {
                userId: beacons.userId,
                username: beacons.username,
                gameName: game,
                platformName: beacons.platforms[index],
                minutesAvailable: beacons.minutesAvailable
            };
            promises.push(this._db.sendBeacon(beacon));
        });
        return Promise.all(promises);
    }

    // format(response) {
    //     return response.map(record => {
    //         let beacon = {};
    //         if (record.returnValue === SUCCESS) {
    //             const recordset = record.recordset[0];
    //             console.log(recordset);
    //             beacon.userId = recordset.UserId;
    //             beacon.gameName = recordset.GameName;
    //             beacon.platformName = recordset.PlatformName;
    //             beacon.success = true;
    //         } else {
    //             beacon.userId = null;
    //             beacon.gameName = null;
    //             beacon.platformName = null;
    //             beacon.success = false;
    //         }
    //         return beacon;
    //     });
    // }

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
            return `No one is waiting for ${listType.toUpperCase()}, yet!\nDon't forget to add yourself to the waiting list. Check out **!helpme games**`;
        }

        const title = listType === allGames ? 'All Available' : `All ${listType}`;
        let list = `WP Looking For Games\n${title} Beacons\n\n`;
        const date = new Date();

        result.recordset.map((beacon, index) => {
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