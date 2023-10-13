import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logout,
  registerationUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateUserInfo,
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
router.put("/update-user-info", isAuthenticated, updateUserInfo);
router.put("/update-user-password", isAuthenticated, updatePassword);

export default router;
