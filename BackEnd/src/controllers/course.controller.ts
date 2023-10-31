import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import { createCourse } from "../services/course.service";
import { redis } from "../utils/redis";

import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";

import courseModel from "../models/course.model";
import notificationiModel from "../models/notification.model";

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;
      const course = await courseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { $new: true }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get single course without purchase
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCacheExist = await redis.get(courseId);
      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      }
      const course = await courseModel
        .findById(courseId)
        .select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
      await redis.set(courseId, JSON.stringify(course));
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allCourses");
      if (isCacheExist) {
        const courses = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          courses,
        });
      }
      const courses = await courseModel
        .find()
        .select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
      await redis.set("allCourses", JSON.stringify(courses));
      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get course content only for valid users
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      const courseExist = userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not eligible to acces this course", 404)
        );
      }

      const course = await courseModel.findById(courseId);
      const content = course?.courseData;
      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId } = req.body as IAddQuestionData;
      const course = await courseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      // create a new question object
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add this question to our course content
      courseContent.questions.push(newQuestion);
      await notificationiModel.create({
        user: req.user?._id,
        title: "New Question",
        message: `You have a new question in ${course?.name}`,
      });
      // save the updated course
      await course.save();
      res.status(200).json({
        success: true,
        courseContent,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add answer in course question
interface IAddAnswerData {
  answer: string;
  contentId: string;
  courseId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, contentId, courseId, questionId } =
        req.body as IAddAnswerData;

      const course = await courseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const questions = courseContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!questions) {
        return next(new ErrorHandler("Invalid questions id", 400));
      }
      // create a new answer object
      const newAnswer: any = {
        user: req.user,
        answer,
      };

      // add this answer to the course
      questions.questionReplies.push(newAnswer);
      await course?.save();
      if (req.user?._id === questions.user._id) {
        // create a notification to admin
      }
      const data = {
        name: questions.user.name,
        title: courseContent.title,
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/question-reply.ejs"),
        data
      );
      try {
        await sendMail({
          email: questions.user.email,
          subject: "Question Reply",
          template: "question-reply.ejs",
          data,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add review in course
interface IAddReviewData {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      // check course id exists in course list based on id
      const courseExist = userCourseList.some(
        (course: any) => course._id.toString() === courseId.toString()
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not allowed to access this course", 404)
        );
      }
      const { review, rating, userId } = req.body as IAddReviewData;
      const course = await courseModel.findById(courseId);
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      course?.reviews.push(reviewData);
      let avg = 0;
      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });
      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();
      const notification = {
        title: "New Review Recieved",
        message: `${req.user?.name} has given a review in ${course?.name}`,
      };
      // create a notification

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

// add reply in review
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found!", 404));
      }
      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );
      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }
      const replyData: any = {
        user: req.user,
        comment,
      };
      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies.push(replyData);
      await course?.save();
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
