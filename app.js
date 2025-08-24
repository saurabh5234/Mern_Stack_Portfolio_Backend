import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbconnection from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js"; 
import messageRouter from "./router/messageRoutes.js";
import userRouter from "./router/userRoutes.js";
import timelineRouter from "./router/timelineRoutes.js"; // Import the timeline routes
import applicationRouter from "./router/softwareApplication.js"; // Import the application routes
import skillRouter from"./router/skillRoutes.js"; // Import the skill routes
import projectRoutes from "./router/projectRoutes.js"; // Import the project routes


dotenv.config({ path: "./config/config.env" });

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
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

// Router
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use('/api/v1/timeline', timelineRouter);
app.use('/api/v1/application', applicationRouter); // Use the application routes
app.use('/api/v1/skill', skillRouter); // Use the skill routes
app.use('/api/v1/project', projectRoutes); // Use the project routes

// Database and error handler
dbconnection();
app.use(errorMiddleware);

export default app;