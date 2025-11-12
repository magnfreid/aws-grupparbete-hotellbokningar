const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { sendResponse } = require("../../responses/index");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {

   try {
    // Hämtar reservedId
    const reservedId = event?.pathParameters?.id;
    if (!reservedId) {
      return sendResponse(400, { message: "No reservedId in path: /reservation/{id}" });
    }

    // Hämtar rummet som är kopplat till reservedIdt
    const queryRes = await db.send(new QueryCommand({
      TableName: "room-db",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      FilterExpression: "reservedId = :rid", // filtrerar efter reservedId
      ExpressionAttributeValues: {
        ":pk": "hotel",
        ":sk": "ROOM-",
        ":rid": reservedId  
      }
    }));
      // checkor om något rum finns, annars skickar tillbaka 404
    const item = queryRes.Items?.[0];
    if (!item) {
      return sendResponse(404, { message: `No reservation found with reservedId ${reservedId}` });
    }

    // uppdaterar/skriver över fälten till null
    const result= await db.send(new UpdateCommand({
      TableName: "room-db",
      Key: { PK: item.PK, SK: item.SK },
      UpdateExpression: "SET reservedId = :n, checkIn = :n, checkOut = :n, guests = :n, #n = :n, email = :n",
      ExpressionAttributeNames: { "#n": "name" },
      ExpressionAttributeValues: { ":n": null },
      ReturnValues: "ALL_NEW"
    }));

    return sendResponse(200, {
      message: `Reservation with reservedId ${reservedId} cancelled`,
      reservation: result.Attributes
    });

  } catch (err) {
    console.error("Failed to clear reservation by reservedId", err);
    return sendResponse(500, { error: err.message });
  }
  
};
