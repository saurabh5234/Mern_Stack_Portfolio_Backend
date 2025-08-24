import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import softwareApplication from "../models/softwareApplicationSchema.js";
import {v2  as cloudinary} from "cloudinary";

export const addNewApplication = catchAsyncErrors(async (req, res, next) => {
  
  if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("software application icon/svg required", 400));
    }
    const { svg } = req.files;
    const {name} = req.body;

    if(!name){
        return next(new ErrorHandler("Application name is required", 400));
    }


    const cloudinaryResponseForSvg = await cloudinary.uploader.upload(
        svg.tempFilePath, {
         folder: "Portfolio_Software_Application"
        });
    if(!cloudinaryResponseForSvg || cloudinaryResponseForSvg.error) {
        console.error("Cloudinary upload error:", cloudinaryResponseForSvg.error || "Unknown error");
        return next(new ErrorHandler("Failed to upload SVG.", 500));
    }

    const newApplication = await softwareApplication.create({
        name: req.body.name,
        svg: {
            public_id: cloudinaryResponseForSvg.public_id,
            url: cloudinaryResponseForSvg.secure_url
        }
    });

    res.status(201).json({
        success: true,
        message: "Application created successfully",
        data: newApplication
    });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const application = await softwareApplication.findByIdAndDelete(id);

  if (!application) {
    return next(new Error("Application not found", 400));
  }
  const softwareApplicationsvgId = application.svg.public_id;
  await cloudinary.uploader.destroy(softwareApplicationsvgId);
  await application.deleteOne();
  res.status(200).json({
    success: true,
    message: "Application deleted successfully",
    data: {}
  });
});

export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
  const applications = await softwareApplication.find(); // Changed from Application

  res.status(200).json({
    success: true,
    data: applications
  });
});
