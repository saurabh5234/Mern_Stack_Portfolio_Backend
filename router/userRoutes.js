import express from "express";
import { getUser, register, updateProfile } from "../controller/userController.js";
import { login } from "../controller/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { logout } from "../controller/userController.js";
import { updatePassword } from "../controller/userController.js";
import { getUserPortfolio } from "../controller/userController.js";
import { forgetPassword } from "../controller/userController.js";
import { resetPassword } from "../controller/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/update/me", isAuthenticated, updateProfile); // Assuming this is for admin to get all users
router.put("/update/password", isAuthenticated, updatePassword);
router.get("/me/portfolio", isAuthenticated, getUserPortfolio);
router.post("/password/forgot", forgetPassword);
router.put("/password/reset/:token", resetPassword);

export default router;


