import express from "express";
import {
  activateUser,
  loginUser,
  logout,
  registerationUser,
  updateAccessToken,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/registeration", registerationUser);
router.post("/activation", activateUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logout);
router.get("/refreshtoken", updateAccessToken);

export default router;
