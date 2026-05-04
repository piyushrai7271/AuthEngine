import express from "express";
import cors from "cors";
import corsOptions from "./configs/cors.js";
import cookieParser from "cookie-parser";
import sessionMiddleware from "./middlewares/session.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

//  IMPORTANT FOR RAILWAY / RENDER / PRODUCTION HTTPS
app.set("trust proxy", 1);

// USE SHARED CORS CONFIG
app.use(cors(corsOptions));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

// routes
import userRoutes from "./routes/auth.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

app.use("/api/auth", userRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/admin",adminRoutes);


// ❗ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ❗ error middleware (LAST)
app.use(errorMiddleware);

export default app;