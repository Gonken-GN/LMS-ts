import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";

import notificationiModel from "../models/notification.model";

// get all notifications
export const getNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await notificationiModel
        .find()
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// update notification status -- admin only
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationiModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 500));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }
      await notification.save();
      const notifications = await notificationiModel
        .find()
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
