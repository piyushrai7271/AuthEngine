import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ routes (example)
import userRoutes from "./routes/auth.routes.js";
app.use("/api/auth", userRoutes);


// // ❗ 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// ❗ error middleware (LAST)
app.use(errorMiddleware);

export default app;