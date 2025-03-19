import mongoose from "mongoose";
import * as dotevnv from "dotenv";

dotevnv.config();

if (!process.env.DATABASE) {
  console.error(`[${new Date().toISOString()}] No database value specified...`);
}
const initializeDatabase = async (connectionString: string) => {
  try {
    await mongoose.connect(connectionString);
    console.info(`[${new Date().toISOString()}] Connected to MongoDB`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error connecting to MongoDB`, error);
  }
};

export default initializeDatabase;
