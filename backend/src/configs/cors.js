// config/cors.js
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [];

// your main production domain
const PROD_DOMAIN = "https://authengine.netlify.app";

const corsOptions = {
  origin: (origin, callback) => {
    // allow tools like Postman / mobile apps
    if (!origin) return callback(null, true);

    //  exact match (env-based: localhost + prod)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    //  allow ONLY your Netlify preview deployments
    // e.g. https://deploy-preview-1--authengine.netlify.app
    if (
      origin.endsWith(".netlify.app") &&
      origin.includes("authengine")
    ) {
      return callback(null, true);
    }

    //  block everything else
    return callback(new Error(`CORS blocked: ${origin}`));
  },

  credentials: true,
};

export default corsOptions;