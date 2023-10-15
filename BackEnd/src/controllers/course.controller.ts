import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "middleware/catchAsyncError";
import ErrorHandler from "utils/ErrorHandler";
import cloudinary from "cloudinary";

export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});