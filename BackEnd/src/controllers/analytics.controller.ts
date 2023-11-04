import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import orderModel from "../models/order.model";

// get users analytics -- only admin
export const getUserAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(userModel);
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get users analytics -- only admin
export const getCourseAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const courses = await generateLast12MonthsData(courseModel);
        res.status(200).json({
          success: true,
          courses,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  // get users analytics -- only admin
export const getOrderAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const orders = await generateLast12MonthsData(orderModel);
        res.status(200).json({
          success: true,
          orders,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );