const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { sendResponse } = require("../../responses/index");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
	try {
		const { roomId, checkInDate, checkOutDate, guests, name, email } =
			JSON.parse(event.body);

		const checks = {
			roomId: roomId,
			checkInDate: checkInDate,
			checkOutDate: checkOutDate,
			guests: guests,
			name: name,
			email: email,
		};

		//Check all fields submitted
		for (const [key, value] of Object.entries(checks)) {
			if (!value) {
				return sendResponse(400, {
					message: `${key} not provided.`,
				});
			}
		}

		//Check date
		if (checkInDate >= checkOutDate)
			return sendResponse(400, {
				message: "Check out date cannot be before check in date.",
			});

		const reservationId = Math.floor(Math.random() * 1000000).toString();

		const params = {
			TableName: "room-db",
			Key: {
				PK: "hotel",
				SK: `ROOM-${roomId}`,
			},
			UpdateExpression:
				"SET reservedId = :reservationId, checkIn = :checkInDate, checkOut = :checkOutDate, guests = :guests, #n = :name, email = :email",
			ExpressionAttributeNames: {
				"#n": "name",
				"#c": "capacity",
			},
			ConditionExpression: "reservedId = :nullVal AND #c >= :guests",
			ExpressionAttributeValues: {
				":nullVal": null,
				":reservationId": reservationId,
				":checkInDate": checkInDate,
				":checkOutDate": checkOutDate,
				":name": name,
				":email": email,
				":guests": guests,
			},
			ReturnValues: "ALL_NEW",
		};

		const result = await db.send(new UpdateCommand(params));

		return sendResponse(200, {
			message: "Success",
			reservation: result.Attributes,
		});
	} catch (err) {
		const isConditionFail = err.message === "The conditional request failed";
		return sendResponse(400, {
			error: isConditionFail
				? "Room not available or number of guests exceeds capacity."
				: err.message,
		});
	}
};
