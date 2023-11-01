import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import { newOrder } from "../services/order.service";

import orderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import notificationiModel from "../models/notification.model";

import { NextFunction, Request, Response } from "express";
import path from "path";
import ejs from "ejs";

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      const user = await userModel.findById(req.user?._id);
      const courseExistUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );
      if (courseExistUser) {
        return next(new ErrorHandler("User already purchased", 400));
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        {
          order: mailData,
        }
      );
      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      user?.courses.push(course?._id);
      await user.save();

      await notificationiModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
      });
     course.purchased ? course.purchased += 1 : course.purchased;
      await course.save();
      newOrder(data, res, next);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all users -- only for admin
export const get = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        getAllCourses(res);
      }catch (error: any){
        return next(new ErrorHandler(error.message, 400));
      }
    });