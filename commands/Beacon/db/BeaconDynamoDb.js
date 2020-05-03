const AWS = require("aws-sdk");
const secrets = require("./secrets");

AWS.config.update({
    region: secrets.region,
    endpoint: secrets.endpoint
});

module.exports = class BeaconDynamoDb {
    constructor() {
        this._docClient = new AWS.DynamoDB.DocumentClient()
        this._table = secrets.table
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
                ":timeleft": dateTimeNow
            }
        };

        const data = await this.query(params);
        return data;
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

    async stopBeaconsByUser(userId) {
        const beacons = await this.getBeaconsByUserId(userId);

        const promises = beacons.Items.map(beacon => {
            const item = Object.assign({}, beacon)
            item.EndTime = this.endingTime(0)
            const params = {
                TableName: this.table,
                Item: item
            };
            return this.put(params);
        });

        const response = await Promise.all(promises);
        response.forEach(r => console.log(r))
        return response;
    }

    async getBeaconsByUserId(userId) {
        const dateTimeNow = Date.now()
        const params = {
            TableName: this.table,
            IndexName: "BeaconsByUserId",
            KeyConditionExpression: "UserId = :userId AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":timeleft": dateTimeNow
            }
        };

        const data = await this.query(params);
        return data;
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
