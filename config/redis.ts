import { createClient } from "redis";

let client: any;

export const redisClient = async () => {
  if (!client) {
    client = createClient();
    client.on("error", (err: any) => console.error("Redis Client Error!", err));
    try {
      await client.connect();
      console.log("Redis client connected successfully!");
    } catch (err) {
      console.error("Failed to connect to Redis!", err);
      throw err;
    }
  }
  return client;
};
