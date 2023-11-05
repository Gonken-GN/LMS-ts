import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {} from "../controllers/layout.controller";

const router = express.Router();

export default router;