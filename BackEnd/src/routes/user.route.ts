import express from "express";
import {
  activateUser,
  loginUser,
  logout,
  registerationUser,
} from "../controllers/user.controller";

const router = express.Router();

router.post("/registeration", registerationUser);
router.post("/activation", activateUser);
router.post("/login", loginUser);
router.get("/logout", logout);


export default router;
