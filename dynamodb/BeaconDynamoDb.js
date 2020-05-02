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
                    "EndTime": beacon.EndTime
                }
            };
            return docClient.delete(params).promise();
        });

        const response = await Promise.all(promises);
        return response;
    }
}
