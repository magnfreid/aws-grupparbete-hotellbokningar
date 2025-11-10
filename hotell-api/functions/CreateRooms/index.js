const { DynamoDBClient } =  require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let rooms = [
  { roomId: "101", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "102", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "103", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "104", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "105", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "106", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "107", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "108", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "109", roomType: "single", capacity: 1, price: 1500 },
  { roomId: "110", roomType: "single", capacity: 1, price: 1500 },

  { roomId: "111", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "112", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "113", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "114", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "115", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "116", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "117", roomType: "double", capacity: 2, price: 2500 },
  { roomId: "118", roomType: "double", capacity: 2, price: 2500 },

  { roomId: "219", roomType: "suite", capacity: 4, price: 5000 },
  { roomId: "220", roomType: "suite", capacity: 4, price: 5000 },
];

// Lägg till PK, SK och ersätt tomma strängar med null
const formattedRooms = rooms.map(room => ({
  PK: "hotel",
  SK: `ROOM-${room.roomId}`,
  reservedId: null,
  name: null,
  email: null,
  checkIn: null,
  checkOut: null,
  ...room
}));

exports.handler = async (event) => {
  const tableName = "room-db";

  const params = {
    RequestItems: {
      [tableName]: formattedRooms.map(room => ({
        PutRequest: { Item: room }
      }))
    }
  };

  try {
    const result = await docClient.send(new BatchWriteCommand(params));
    console.log("Batch write succeeded:", result);

    if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
      console.log("Some items were unprocessed. Retry them separately:", result.UnprocessedItems);
    }
  } catch (err) {
    console.error("Batch write failed:", err);
  }
};