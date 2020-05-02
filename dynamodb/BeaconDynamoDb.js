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
}
