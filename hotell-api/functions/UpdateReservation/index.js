const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	UpdateCommand,
	QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { sendResponse } = require("../../responses/index");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
	try {
		const reservedId = event?.pathParameters?.id;

		if (!reservedId) {
			return sendResponse(400, {
				message: "No reservedId in path: /reservation/{id}",
			});
		}

		// Hämtar rummet som är kopplat till reservedIdt
		const queryRes = await docClient.send(
			new QueryCommand({
				TableName: "room-db",
				KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
				FilterExpression: "reservedId = :rid", // filtrerar efter reservedId
				ExpressionAttributeValues: {
					":pk": "hotel",
					":sk": "ROOM-",
					":rid": reservedId,
				},
			})
		);
		// checkor om något rum finns, annars skickar tillbaka 404
		const room = queryRes.Items?.[0];
		if (!room) {
			return sendResponse(404, {
				message: `No reservation found with reservedId ${reservedId}`,
			});
		}

		const updateAttributes = JSON.parse(event.body);

		const updateExpression =
			"set " +
			Object.keys(updateAttributes)
				.map((attribute) => `#${attribute} = :${attribute}`)
				.join(", ");

		const expressionAttributeValues = Object.keys(updateAttributes).reduce(
			(values, attributeName) => {
				values[`:${attributeName}`] = updateAttributes[attributeName];
				return values;
			},
			{}
		);

		const expressionAttributeNames = Object.keys(updateAttributes).reduce(
			(names, attributeName) => {
				names[`#${attributeName}`] = attributeName;
				return names;
			},
			{}
		);

		const command = new UpdateCommand({
			TableName: "room-db",
			Key: { PK: "hotel", SK: room.SK },
			ReturnValues: "ALL_NEW",
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
		});

		const response = await docClient.send(command);
		return sendResponse(200, { message: response.Attributes });
	} catch (error) {
		return sendResponse(400, { message: error.message });
	}
};
