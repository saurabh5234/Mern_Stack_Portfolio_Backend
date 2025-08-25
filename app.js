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

// ✅ CORS configuration with dynamic origin
const allowedOrigins = [
  "http://localhost:5173",    // dashboard local
  "http://localhost:5174",    // portfolio local
  "https://porfoliodashboardme.netlify.app", // deployed dashboard
  "https://saurabhportfoliofrontend.netlify.app", // deployed portfolio
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
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
