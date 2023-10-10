import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logout,
  registerationUser,
  socialAuth,
  updateAccessToken,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/registeration", registerationUser);
router.post("/activation", activateUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logout);
router.get("/refreshtoken", updateAccessToken);
router.get("/me", isAuthenticated, getUserInfo);
router.post("/socialAuth", socialAuth);

export default router;
