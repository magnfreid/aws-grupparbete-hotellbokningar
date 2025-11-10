import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


let rooms = [
  { roomId: "101", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "", },
  { roomId: "102", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "103", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "104", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "105", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "106", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "107", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "108", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "109", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "110", roomType: "single", capacity: 1, price: 1500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },

  { roomId: "111", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "112", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "113", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "114", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "115", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "116", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "117", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "118", roomType: "double", capacity: 2, price: 2500, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  
  { roomId: "219", roomType: "suite", capacity: 4, price: 5000, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
  { roomId: "220", roomType: "suite", capacity: 4, price: 5000, reservedId: "", name: "", email: "", checkIn: "", checkOut: "" },
];




exports.handler = async (event) => {

  const tableName = "room-db";
const params = {
  RequestItems: {
    [tableName]: rooms.map(room => ({
      PutRequest: { Item: room }
    }))
  }
};

try {
  const result = await docClient.send(new BatchWriteCommand(params));
  console.log("Batch write succeeded:", result);
} catch (err) {
  console.error("Batch write failed:", err);
}
};
