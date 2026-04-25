// config/cors.js

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // exact match (production, localhost)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow all Netlify deployments (safe check)
    if (origin.endsWith(".netlify.app")) {
      return callback(null, true);
    }

    // block others
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

export default corsOptions;