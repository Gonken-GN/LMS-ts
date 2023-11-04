import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  getCourseAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} from "../controllers/analytics.controller";

const router = express.Router();
router.get(
  "/get-users-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getUserAnalytics
);
router.get(
  "/get-courses-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getCourseAnalytics
);
router.get(
  "/get-orders-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getOrderAnalytics
);

export default router;
