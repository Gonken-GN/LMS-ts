import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsersService,
  getUserInfo,
  loginUser,
  logout,
  registerationUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

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
router.put("/update-user-avatar", isAuthenticated, updateProfilePicture);
router.get(
  "/getAll-users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsersService
);
router.put(
  "/update-user-role",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole
);
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser
);

export default router;
