const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
	try {
		const command = new QueryCommand({
			TableName: "room-db",
			KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
			ExpressionAttributeValues: {
				":PK": "hotel",
				":SK": "ROOM",
			},
		});

		const { Items } = await docClient.send(command);

		const filteredItems = Items.filter((item) => item.reservedId != null);

		return {
			statusCode: 200,
			body: JSON.stringify({
				reservations: filteredItems,
			}),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: `${error.message}`,
			}),
		};
	}
};
