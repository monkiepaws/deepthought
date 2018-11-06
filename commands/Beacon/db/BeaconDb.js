const sql = require('mssql');
const secrets = require('./secrets.js');
const getAvailableBeacons = require('./getAvailableBeacons.js');
const getBeaconsByGame = require('./getBeaconsByGame.js');
const sendBeacon = require('./sendBeacon.js');
const stopBeaconsByUser = require('./stopBeaconsByUser.js');
const stopBeaconByUserAndGame = require('./stopBeaconByUserAndGame.js');

module.exports = class BeaconDb {
    constructor() {
        this._pool = null;
        this.request = {
            getAvailableBeacons,
            getBeaconsByGame,
            sendBeacon,
            stopBeaconsByUser,
            stopBeaconByUserAndGame
        };
        this.getConnection = this.getConnection.bind(this);
    }

    getConnection() {
        if (this._pool) return this._pool;
        return this._pool = new Promise(function(resolve, reject) {
            const connection = new sql.ConnectionPool(secrets, function(err) {
                if (err) {
                    this._pool = null;
                    return reject(err);
                }
                return resolve(connection);
            });
        });
    }
}