const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { sendResponse } = require("../../responses/index");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    // const { roomId } = JSON.parse(event.queryStringParameters);

      const query = await db.send(
      new QueryCommand({
        TableName: "room-db",
        IndexName: "reservedId-index",
        KeyConditionExpression: "reservedId = :rid",
        ExpressionAttributeValues: { ":rid": id }
      })
    );

    if (!query.Items || query.Items.length === 0) {
      return sendResponse(404, { message: `Ingen reservation hittades för reservedId ${id}` });
    }

    const item = query.Items[0];

    // const params = {
    //   TableName: "room-db",
    //   Key: {
    //     PK: "hotel",
    //     SK: `RESERVEDID-${id}`,
    //     SK: `ROOM-${id}`
    //   },

    //   UpdateExpression:
    //     "SET reservedId = :n, checkIn = :n, checkOut = :n, guests = :n, #n = :n, email = :n",
    //   ExpressionAttributeNames: {
    //     "#n": "name"
    //   },
    //   ExpressionAttributeValues: {
    //     ":n": null
    //   },

    //   ReturnValues: "ALL_NEW"
    // };

     const result = await db.send(
      new UpdateCommand({
        TableName: "room-db",
        Key: { PK: item.PK, SK: item.SK },
        UpdateExpression:
          "SET reservedId = :n, checkIn = :n, checkOut = :n, guests = :n, #n = :n, email = :n",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: { ":n": null },
        ReturnValues: "ALL_NEW"
      })
    );

    // const result = await db.send(new UpdateCommand(params));

    return sendResponse(200, {
      message: "Fields set to NULL",
      reservation: result.Attributes
    });

  } catch (err) {

    console.error("Failed to clear reservation", err);

    return sendResponse(400, { error: err.message });
  }
};
