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
        this.getConnection = this.getConnection.bind(this);
        this.getAvailableBeacons = this.getAvailableBeacons.bind(this);
        this.getBeaconsByGame = this.getBeaconsByGame.bind(this);
        this.sendBeacon = this.sendBeacon.bind(this);
        this.stopBeaconsByUser = this.stopBeaconsByUser.bind(this);
    }

    getConnection() {
        const config = secrets;
        if (this._pool) return this._pool;
        this._pool = new Promise(function(resolve, reject) {
            const connection = new sql.ConnectionPool(config, function(err) {
                if (err) {
                    this._pool = null;
                    return reject(err);
                }
                return resolve(connection);
            });
        });
        return this._pool;
    }

    async getAvailableBeacons() {
        try {
            const connection = await this.getConnection();
            const request = await new sql.Request(connection);
            return request.execute(`spGetAllAvailableBeacons`);
        } catch (err) {
            console.log(err);
        }
    }

    async getBeaconsByGame(gameName) {
        try {
            const connection = await this.getConnection();
            const request = await new sql.Request(connection);
            return request.input(`GameName`, sql.NVarChar, gameName)
                .execute(`spGetAvailableBeaconsByGame`);
        } catch (err) {
            console.log(err);
        }
    }

    async sendBeacon(userId, username, gameName, platformName, minutesAvailable) {
        try {
            const connection = await this.getConnection();
            const request = await new sql.Request(connection);
            return request.input(`UserId`, sql.VarChar, userId.toString())
                .input(`Username`, sql.NVarChar, username)
                .input(`GameName`, sql.NVarChar, gameName)
                .input(`PlatformName`, sql.NVarChar, platformName)
                .input(`MinutesAvailable`, sql.Int, minutesAvailable)
                .execute(`spBeacon_Insert`);
        } catch (err) {
            console.log(err);
        }
    }

    async stopBeaconsByUser(userId) {
        try {
            const connection = await this.getConnection();
            const request = await new sql.Request(connection);
            return request.input(`UserId`, sql.VarChar, userId.toString())
                .execute(`spBeacon_Update_StopAll`);
        } catch(err) {
            console.log(err);
        }
    }
};