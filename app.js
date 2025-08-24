import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbconnection from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js"; 
import messageRouter from "./router/messageRoutes.js";
import userRouter from "./router/userRoutes.js";
import timelineRouter from "./router/timelineRoutes.js";
import applicationRouter from "./router/softwareApplication.js";
import skillRouter from "./router/skillRoutes.js";
import projectRoutes from "./router/projectRoutes.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",   // local dashboard
      "http://localhost:5174",   // local portfolio
      "https://porfoliodashboardme.netlify.app", // deployed dashboard (Netlify)
      "https://mern-quiz-frontend.vercel.app",   // deployed quiz app (if needed)
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allow cookies/auth headers
  })
);

// Cookie parser
app.use(cookieParser());

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

// Routers
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRoutes);

// Database and error handler
dbconnection();
app.use(errorMiddleware);

export default app;
