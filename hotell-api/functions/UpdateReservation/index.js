const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { sendResponse } = require("../../responses/index");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
	try {
		const updateAttributes = JSON.parse(event.body);
		const roomId = updateAttributes.roomId;

		if (!roomId) return sendResponse(400, { message: "Room id not provided." });
		if (updateAttributes.reservedId == null)
			return sendResponse(404, { message: "Reservation not found." });

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
			Key: { PK: "hotel", SK: roomId },
			ReturnValues: "ALL_NEW",
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
		});

		const response = await docClient.send(command);
		return sendResponse(200, { message: response });
	} catch (error) {
		return sendResponse(400, { message: error });
	}
};
