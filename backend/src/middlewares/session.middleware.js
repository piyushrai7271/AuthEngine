import session from "express-session";
import MongoStore from "connect-mongo";

const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",

  resave: false,
  saveUninitialized: false,

  store: new MongoStore({
    mongoUrl: process.env.MONGO_URL,
    touchAfter: 24 * 3600,
  }),

  cookie: {
    secure: isProduction,
    httpOnly: true,

    // ✅ IMPORTANT FOR OAUTH CROSS-DOMAIN
    sameSite: isProduction ? "none" : "lax",

    maxAge: 1000 * 60 * 60 * 24,
  },
});

export default sessionMiddleware;