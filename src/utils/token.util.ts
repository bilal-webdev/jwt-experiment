import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis";
import { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const generateAccessToken = (userId: string) => {
  try {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY!, {
      expiresIn: "15m",
    });
  } catch (error) {
    throw new Error("Failed to generate access token!");
  }
};

export const generateRefreshToken = async (userId: string) => {
  try {
    const refreshToken = jwt.sign(
      { userId: userId },
      process.env.JWT_REFRESH_SECRET_KEY!,
      { expiresIn: "7d" }
    );
    const client = await redisClient();
    await client.set(userId.toString(), refreshToken);
    return refreshToken;
  } catch (error) {
    throw new Error("Failed to generate refresh token!");
  }
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY!) as DecodedToken;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Access token has expired!");
    } else if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid access token!");
    } else {
      throw new Error("Failed to verify access token!");
    }
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET_KEY!
    ) as DecodedToken;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired!");
    } else if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token!");
    } else {
      throw new Error("Failed to verify refresh token!");
    }
  }
};

export const validateRefreshToken = async (token: string, userId: string) => {
  try {
    const client = await redisClient();
    const storedToken = await client.get(userId.toString());
    return storedToken === token;
  } catch (error) {
    throw new Error("Failed to validate refresh token!");
  }
};

export const invalidateToken = async (accessToken: string, userId: string) => {
  try {
    const client = await redisClient();
    await client.del(userId);
    const decodedToken = jwt.decode(accessToken) as JwtPayload;
    if (decodedToken && decodedToken.exp) {
      const ttl = decodedToken.exp - Math.floor(Date.now() / 1000);
      await client.set(`blacklist_${accessToken}`, "true", {
        EX: ttl,
      });
    } else {
      throw new Error(
        "Failed to decode token or token does not have an expiration date!"
      );
    }
  } catch (error) {
    throw new Error("Failed to invalidate token!");
  }
};
