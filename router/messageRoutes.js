import express from "express";
import { createMessage, getAllMessages,deleteMessage } from "../controller/messageController.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.post("/send", createMessage);
router.get("/getall", getAllMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage);

export default router;
