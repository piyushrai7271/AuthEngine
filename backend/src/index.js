// dotenv handled first
import "./configs/env.js";

import app from "./app.js";
import connectDb from "./configs/db.connection.js";
const port = process.env.PORT;


connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running on Port:", port);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection error :", err.message);
  });
