const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { sendResponse } = require("../responses/index");

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
	try {
		const updateAttributes = JSON.parse(event.body);
		const roomId = updateAttributes.roomId;
		console.log("Room ID: ", roomId);

		//Checka att roomId är med

		const updateExpression =
			"set " +
			Object.keys(updateAttributes)
				.map((attribute) => `${attribute} = :${attribute}`)
				.join(", ");

		const expressionAttributeValues = Object.keys(updateAttributes).reduce(
			(values, attributeName) => {
				values[`:${attributeName}`] = updateAttributes[attributeName];
				return values;
			},
			{}
		);

		const command = new UpdateCommand({
			TableName: "room-db",
			Key: { PK: "hotel", SK: roomId },
			ReturnValues: "ALL_NEW",
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
		});

		const response = await docClient.send(command);
		return sendResponse(200, { message: response });
	} catch (error) {
		return sendResponse(400, { message: error });
	}
};
