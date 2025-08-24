import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/projectSchema.js";
import {v2 as cloudinary} from "cloudinary";

//addNewProject
export const addNewProject = catchAsyncErrors(async (req, res, next) => {
    // Change from req.file to req.files
    if(!req.files || !req.files.image) {
        return next(new ErrorHandler("Image is required", 400));
    }

    const { image } = req.files;
    const { title, description, technologies, githubLink, liveLink, stack } = req.body;

    // Validation
    if (!title || !description || !technologies || !githubLink || !liveLink || !stack) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "Portfolio_Projects"
    });

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("Failed to upload image", 500));
    }

    // Create project
    const newProject = await Project.create({
        title,
        description,
        technologies,
        githubLink,
        liveLink,
        stack,
        image: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        }
    });

    res.status(201).json({
        success: true,
        message: "Project added successfully",
        data: newProject
    });
});

//deleteProject
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    const projectImageId = project.image.public_id;
    await cloudinary.uploader.destroy(projectImageId);
    await project.deleteOne();

    res.status(200).json({
        success: true,
        message: "Project deleted successfully",
        data: {}
    });
});

//updateProject
export const updateProject = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, technologies, githubLink, liveLink, stack } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { title, description, technologies, githubLink, liveLink, stack },
        { new: true, runValidators: true }
    );

    if (!updatedProject) {
        return next(new ErrorHandler("Project not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject
    });
});

//getallprojects
export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
    const projects = await Project.find();

    res.status(200).json({
        success: true,
        message: "Projects retrieved successfully",
        data: projects
    });
});

//getsingleproject

export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Project retrieved successfully",
        data: project
    });
});
