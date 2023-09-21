require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieparser from "cookie-parser";
import { ErrorMiddleware } from "./src/middleware/error";

app.use(express.json({ limit: "50mb" }));

app.use(cookieparser());

app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    succcess: true,
    messages: "API is working",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Router ${req.originalUrl} is not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
