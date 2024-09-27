import express from "express";
import { userRouter } from "./user.route";

const API = express();

API.use("/user", userRouter);

export default API;