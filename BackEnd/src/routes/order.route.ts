import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createOrder,
  getAllOrdersService,
} from "../controllers/order.controller";

const router = express.Router();
router.post("/create-order", isAuthenticated, createOrder);
router.get(
  "/getAll-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrdersService
);

export default router;
