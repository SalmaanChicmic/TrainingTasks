import { connect } from "mongoose";

const MONGODB_URL = "mongodb://127.0.0.1:27017";

export async function ConnectDatabase() {
  try {
    // Connect to the MongoDB cluster
    await connect(MONGODB_URL);
    console.log("Db Connected");
  } catch (e) {
    console.error(e);
  }
}
