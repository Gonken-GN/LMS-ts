require("dotenv").config();
// @ts-ignore
import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieparser from "cookie-parser";
import { ErrorMiddleware } from "./src/middleware/error";

import userRouter from "./src/routes/user.route";
import courseRouter from "./src/routes/course.route";
import orderRouter from "./src/routes/order.route";
import noitificationRouter from "./src/routes/notifications.route";
import analyticsRouter from "./src/routes/analytics.route";

app.use(express.json({ limit: "50mb" }));

app.use(cookieparser());

app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// Routes
app.use(
  "/api/v1",
  userRouter,
  courseRouter,
  orderRouter,
  noitificationRouter,
  analyticsRouter
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
