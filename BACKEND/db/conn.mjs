import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.ATLAS_URI || "";
console.log("Connection String:", connectionString); // Log the connection string

const client = new MongoClient(connectionString);

let conn;
try {
    conn = await client.connect();
    console.log('mongoDB is CONNECTED!!! :)');
} catch (e) {
    console.error("Connection Error:", e);
}

let db = client.db("users"); // Ensure the database name is correct

export default db;
