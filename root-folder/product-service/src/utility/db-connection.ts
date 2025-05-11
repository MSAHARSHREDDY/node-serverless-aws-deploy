import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
mongoose.set("strictQuery", false);


const ConnectDB = async () => {
  const DB_URL =process.env.DB_URL;

  try {
    await mongoose.connect(DB_URL!);//Adding ! tells TypeScript: “Trust me, this is not undefined.”
  } catch (err) {
    console.log("failed to connect db")
    console.log(err);
  }
};

export { ConnectDB };
