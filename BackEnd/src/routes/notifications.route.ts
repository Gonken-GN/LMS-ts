import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  getNotifications,
  updateNotification,
} from "../controllers/notification.controller";

const router = express.Router();
router.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotifications
);
router.put(
  "/update-notifications/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotification
);

export default router;
