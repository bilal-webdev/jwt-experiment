import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectToDatabse from "./config/db";
import apis from "./src/routes/api";
import { errorHandler } from "./src/middlewares/error.middleware";
import { _Error } from "./src/utils/error.util";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

// Connect to MongoDB
connectToDatabse();
function exitHandler(options: any) {
  mongoose.connection.close();
  process.exit();
}
// for ensuring db connection is closed properly and any necessary cleanup is done before the application exits.
process.on("SIGINT", exitHandler.bind(null, { cleanup: true }));

app.set("port", PORT);
app.use(express.json());
app.use(bodyParser.json({ limit: "1gb" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1gb" }));

const allowedOrigins = ["http://localhost:3000"];
const corsOption = {
  origin: (origin: any, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 600,
};

app.use(cors(corsOption));

// for all registered API routes
app.use("/api/v1", apis);

// For non-registered routes
app.use("/", function (req: Request, res: Response, next: NextFunction) {
  next(new _Error("Route not registered!", 404));
});

// for handling errors response
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`JWT backend server is active on PORT: ${PORT}`);
});
