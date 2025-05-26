const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://dbuser:dynamo1927@cluster0.lpotvzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let cached = null;

module.exports = async function connectDB() {
  if (!cached) {
    await client.connect();
    const db = client.db("notesdb").collection("notes");
    cached = db;
  }
  return cached;
};