// import moment from "moment-timezone";
import mongoose, { ConnectOptions } from "mongoose";

// console.log(process.env.PORT);
const connectDB = async (): Promise<void> => {
  try {
    const options: ConnectOptions = {
      dbName: process.env.MONGO_DB,
      minPoolSize: 5,
      maxPoolSize: 20,
      user: process.env.MONGO_PASSWORD,
      passphrase: process.env.MONGO_PASSWORD,
    };

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017",
      options
    );

    console.log("MongoDB connected");
  } catch (error) {
    // appLogInsert(error);
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
