const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const {sendResponse} = require("../../responses/index")

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, roomType } = JSON.parse(event.body);

    const reservationId = Math.floor(Math.random() * 1000000).toString();

    const params = {
      TableName: "room-db",
      Key: {
        PK: "hotel",
        SK: `ROOM-${roomId}`
      },
      UpdateExpression: "SET reservedId = :reservationId, checkIn = :checkInDate, checkOut = :checkOutDate, guests = :guestList",
      ConditionExpression: "attribute_not_exists(reservedId)",
      ExpressionAttributeValues: {
        ":reservationId": reservationId,
        ":checkInDate": checkInDate,
        ":checkOutDate": checkOutDate,
        ":guestList": guests
      },
      ReturnValues: "ALL_NEW"
    };

    const result = await db.send(new UpdateCommand(params));

    return sendResponse(200, { message: "Success", reservation: result.Attributes });

  } catch (err) {
    console.error("Reservation failed:", err.message);
    return sendResponse(400, { error: err.message });
  }
};