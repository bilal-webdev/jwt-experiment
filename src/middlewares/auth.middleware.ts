import { NextFunction, Request, Response } from "express";
import { redisClient } from "../../config/redis";
import { verifyAccessToken } from "../utils/token.util";
import { _Error } from "../utils/error.util";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers && req.headers["authorization"];
    if (!authHeader) {
      throw new _Error("Authorization token not found!", 401);
    }
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new _Error("Invalid authorization token!", 401);
    }
    const token = tokenParts[1];
    const client = await redisClient();
    const isBlacklisted = await client.get(`blacklist_${token}`);
    if (isBlacklisted) {
      throw new _Error(
        "Access token is blacklisted. Please log in again!",
        403
      );
    }
    verifyAccessToken(token);
    next();
  } catch (err: any) {
    next(err);
  }
};
