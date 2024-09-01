import mongoose from "mongoose";
import * as dotevnv from "dotenv";

dotevnv.config();

if (!process.env.DATABASE) {
  console.error(`No database value specified...`);
}
const initializeDatabase = async (connectionString: string) => {
  try {
    await mongoose.connect(connectionString);
    console.info("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

export default initializeDatabase;
