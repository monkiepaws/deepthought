const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2",
    endpoint: "http://localhost:8000"
});

module.exports = class BeaconDynamoDb {
    constructor() {
        this._docClient = new AWS.DynamoDB.DocumentClient()
        this._table = "WP_Beacons"
    }

    get docClient() {
        return this._docClient
    }

    get table() {
        return this._table
    }

    query(params) {
        return this.docClient.query(params).promise()
    }

    put(params) {
        return this.docClient.put(params).promise()
    }

    async getAvailableBeacons() {
        const dateTimeNow = Date.now()
        const params = {
            TableName: this.table,
            IndexName: "AllAvailableBeacons",
            KeyConditionExpression: "TypeName = :typename AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":typename": "Beacon",
                ":timeleft": dateTimeNow
            }
        };

        const data = await this.query(params);
        return data;
    }

    async getBeaconsByGame(gameName) {
        const dateTimeNow = Date.now()
        const params = {
            TableName: this.table,
            IndexName: "BeaconsByGameName",
            KeyConditionExpression: "GameName = :gamename AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":gamename": gameName,
                ":timeleft": 2
            }
        };

        const data = await this.query(params);
        return data;
    }

    async getBeaconsByUserId(userId) {
        const dateTimeNow = Date.now()
        const params = {
            TableName: this.table,
            IndexName: "BeaconsByUserId",
            KeyConditionExpression: "UserId = :userId AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":timeleft": 2
            }
        };

        const data = await this.query(params);
        return data;
    }

    async stopBeaconsByUser(userId) {
        const beacons = await this.getBeaconsByUserId(userId);

        const promises = beacons.map(beacon => {
            const item = Object.assign({}, beacon)
            item.EndTime = this.endingTime(0)
            const params = {
                TableName: this.table,
                Item: item
            };
            return this.put(params);
        });

        const response = await Promise.all(promises);
        return response;
    }

    async sendBeacon(userId, username, gameName, platformName, minutesAvailable) {
        const waitingBeacons = this.getBeaconsByGame(gameName)
        const data = await this.getBeaconsByUserId(userId);
        const startTime = this.startingTime(data, gameName, platformName, userId);
        const endTime = this.endingTime(minutesAvailable)

        const params = {
            TableName: this.table,
            Item: {
                "UniqueId": `${userId}-${gameName}-${platformName}-${startTime}`,
                "TypeName": "Beacon",
                "GameName": gameName,
                "PlatformName": platformName,
                "GamePlatformCombination": `${gameName}-${platformName}`,
                "StartTime": startTime,
                "EndTime": endTime,
                "UserId": userId,
                "Username": username
            }
        };

        const response = await this.put(params);
        // Azure/Sql version returned which players were waiting for the same game.
        // To duplicate this functionality, this function returns the results of a
        // this.getBeaconsByGame call
        return await waitingBeacons;
    }

    startingTime(beacons, gameName, platformName, userId) {
        const existingStartTime = beacons.Items.find(beacon =>
                beacon.GameName === gameName
                && beacon.PlatformName === platformName
                && beacon.UserId === userId
        )

        if (existingStartTime) {
            return parseInt(existingStartTime.StartTime)
        } else {
            return Date.now()
        }
    }

    endingTime(minutesAvailable) {
        const time = Date.now();
        const endTime = time + (minutesAvailable * 60000);
        return endTime;
    }
}
