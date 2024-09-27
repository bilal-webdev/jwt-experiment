import express from "express";
import {
  loginUser,
  signupUser,
  userRefreshToken,
} from "../controllers/user.controller";

export const userRouter = express.Router();

userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", userRefreshToken);
