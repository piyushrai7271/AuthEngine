import { createClient } from "redis";

const redisUrl =
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_PROD_URL
    : process.env.REDIS_LOCAL_URL;

const redisClient = createClient({
  url: redisUrl,
});

// CONNECT EVENT
redisClient.on("connect", () => {
  console.log("Redis connected successfully !!");
});

// ERROR EVENT
redisClient.on("error", (error) => {
  console.error("Redis Error:", error);
});

// CONNECT REDIS
await redisClient.connect();

export default redisClient;