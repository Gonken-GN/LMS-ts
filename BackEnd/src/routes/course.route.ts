import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  getAllCourse,
  getAllCourseService,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";

const router = express.Router();

router.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);
router.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse
);
router.get("/get-course/:id", getSingleCourse);
router.get("/get-courses", getAllCourse);
router.get("/get-course-content/:id", isAuthenticated, getCourseByUser);
router.put("/add-question", isAuthenticated, addQuestion);
router.put("/add-answer", isAuthenticated, addAnswer);
router.put("/add-review/:id", isAuthenticated, addReview);
router.put(
  "/add-reply",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview
);
router.get(
  "/getAll-courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllCourseService
);
router.delete(
  "/delete-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCourse
);
export default router;
