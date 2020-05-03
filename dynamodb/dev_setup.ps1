aws dynamodb create-table --cli-input-json file://create.json --endpoint-url http://localhost:8000
aws dynamodb put-item --cli-input-json file://put.json --endpoint-url http://localhost:8000
aws dynamodb query --table-name WP_Beacons --index-name AllAvailableBeacons --key-condition-expression "TypeName = :typename AND EndTime > :timeleft" --expression-attribute-values '{\"":typename\"":{\""S\"":\""Beacon\""},\"":timeleft\"":{\""N\"":\""5\""}}' --endpoint-url http://localhost:8000
aws dynamodb query --table-name WP_Beacons --index-name BeaconsByUserId --key-condition-expression "UserId = :userId AND EndTime > :timeleft" --expression-attribute-values '{\"":userId\"":{\""S\"":\""123456789\""},\"":timeleft\"":{\""N\"":\""5\""}}' --endpoint-url http://localhost:8000
