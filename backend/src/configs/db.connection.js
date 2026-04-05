import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const dbHost = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "authSystem",
    });
    console.log(
      "Database connected successfully on Db Host :",
      dbHost.connection.host,
    );
  } catch (error) {
    console.log("Database base connection failed :", error.message);
    process.exit(1);
  }
};

export default connectDb;
