import express from "express";
import cors from "cors";
import helmet from "helmet";
import corsOptions from "./configs/cors.js";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import sessionMiddleware from "./middlewares/session.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import {globalRateLimiter} from "./middlewares/rateLimit.middleware.js";


const app = express();

// IMPORTANT FOR RAILWAY / RENDER / PRODUCTION HTTPS
app.set("trust proxy", 1);

// HIDE EXPRESS HEADER
app.disable("x-powered-by");

// SECURITY HEADERS
app.use(helmet());

// USE SHARED CORS CONFIG
app.use(cors(corsOptions));

// BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(mongoSanitize());  // NOSQL INJECTION PROTECTION
app.use(cookieParser()); // COOKIE PARSER

// SESSION MIDDLEWARE
app.use(sessionMiddleware);

// GLOBAL RATE LIMITER
app.use(globalRateLimiter);

// ROUTES
import userRoutes from "./routes/auth.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

app.use("/api/auth", userRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/admin", adminRoutes);


// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ERROR MIDDLEWARE
app.use(errorMiddleware);

export default app;