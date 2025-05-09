import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const ConnectDB = async () => {
  const DB_URL =
    "mongodb+srv://saharshreddym59:z5AIsXaYvTum2zo6@cluster0.yco7z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  try {
    await mongoose.connect(DB_URL);
  } catch (err) {
    console.log("failed to connect db")
    console.log(err);
  }
};

export { ConnectDB };
