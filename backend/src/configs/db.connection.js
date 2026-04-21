import mongoose from "mongoose";

const connectDb = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || "authSystem",
    });

    console.log(
      "Database connected successfully on Host:",
      conn.connection.host
    );
  } catch (error) {
    console.error("Database connection failed 💥", error);
    process.exit(1);
  }
};

export default connectDb;