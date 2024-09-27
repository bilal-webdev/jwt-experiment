import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  invalidateToken,
  validateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/token.util";
import { _Error } from "../utils/error.util";

export const signupUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      throw new _Error("User already exists!", 409);
    }
    const newUser = new UserModel({
      name: name,
      email: email,
      password: password,
    });
    await newUser.save();
    const accessToken = generateAccessToken(String(newUser._id));
    const refreshToken = generateRefreshToken(String(newUser._id));
    res.status(200).json({
      success: true,
      msg: "User signed in successfully!",
      details: {
        user: newUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new _Error("Invalid email or password!", 401);
    }
    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));
    res.status(200).json({
      success: true,
      msg: "User logged in successfully!",
      details: {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const userRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new _Error("Refresh token not found!", 404);
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const userId = decoded.userId;
    const isValid = await validateRefreshToken(refreshToken, userId);
    if (!isValid) {
      throw new _Error("Invalid refresh token!", 401);
    }
    const newAccessToken = generateAccessToken(String(userId));
    res.status(200).json({
      success: true,
      msg: "Refresh token generated successfully!",
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.body;
  try {
    const decoded = verifyAccessToken(accessToken);
    const userId = decoded.userId;
    await invalidateToken(accessToken, String(userId));
    res
      .status(200)
      .json({ success: true, message: "User logged out successfully!" });
  } catch (err) {
    next(err);
  }
};
