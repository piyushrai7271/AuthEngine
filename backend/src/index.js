// dotenv first
import "./configs/env.js";

//  process handlers FIRST
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION :", err);
  process.exit(1);
});

import app from "./app.js";
import connectDb from "./configs/db.connection.js";

const port = process.env.PORT || 5000;

let server;

connectDb()
  .then(() => {
    server = app.listen(port, () => {
      console.log("Server is running on Port:", port);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection error :", err.message);
    process.exit(1);
  });

//  async errors
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION :", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});