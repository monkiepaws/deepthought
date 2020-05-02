const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2",
    endpoint: "http://localhost:8000"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "WP_Beacons";

module.exports = class BeaconDynamoDb {
    constructor() {
    }

    async getAvailableBeacons() {
        const dateTimeNow = Date.now()
        const params = {
            TableName: table,
            IndexName: "AllAvailableBeacons",
            KeyConditionExpression: "TypeName = :typename AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":typename": "Beacon",
                ":timeleft": dateTimeNow
            }
        };

        const data = await docClient.query(params).promise();
        return data;
    }

    async getBeaconsByGame(gameName) {
        const dateTimeNow = Date.now()
        const params = {
            TableName: table,
            IndexName: "BeaconsByGameName",
            KeyConditionExpression: "GameName = :gamename AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":gamename": gameName,
                ":timeleft": 2
            }
        };

        const data = await docClient.query(params).promise();
        return data;
    }

    async getBeaconsByUserId(userId) {
        const dateTimeNow = Date.now()
        const params = {
            TableName: table,
            IndexName: "BeaconsByUserId",
            KeyConditionExpression: "UserId = :userId AND EndTime > :timeleft",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":timeleft": 2
            }
        };

        const data = await docClient.query(params).promise();
        return data.Items;
    }

    async stopBeaconsByUser(userId) {
        const beacons = await this.getBeaconsByUserId(userId);

        const promises = beacons.map(beacon => {
            const params = {
                TableName: table,
                Key: {
                    "UniqueId": beacon.UniqueId,
                    "StartTime": beacon.StartTime
                }
            };
            return docClient.delete(params).promise();
        });

        const response = await Promise.all(promises);
        return response;
    }

    startingTime(beacons, gameName, platformName, id) {
        const existingStartTime = beacons.find(beacon => {
            const [userId, name, platform, startTime] = beacon.UniqueId.split("-");
            const existingPrefix = `${userId}-${name}-${platform}`;
            const prefix = `${id}-${gameName}-${platformName}`;
            if (prefix === existingPrefix) {
                return true;
            } else {
                return false;
            }
        });

        if (existingStartTime) {
            const [userId, name, platform, startTime] = existingStartTime.UniqueId.split("-");
            console.log(startTime);
            return parseInt(startTime);
        } else {
            const newtime = Date.now();
            console.log(newtime);
            return newtime;
        }
    }

    endingTime(minutesAvailable) {
        const time = Date.now();
        const endTime = time + (minutesAvailable * 60000);
        return endTime;
    }

    async sendBeacon(userId, username, gameName, platformName, minutesAvailable) {
        const waitingBeacons = this.getBeaconsByGame(gameName)
        const beacons = await this.getBeaconsByUserId(userId);
        const startTime = this.startingTime(beacons, gameName, platformName, userId);
        const endTime = this.endingTime(minutesAvailable)

        const params = {
            TableName: table,
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

        const deleted = await docClient.put(params).promise();
        console.log(deleted);
        return await waitingBeacons;
    }
}
