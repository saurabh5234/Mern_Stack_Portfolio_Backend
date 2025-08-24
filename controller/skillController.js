import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Skill } from "../models/skillsSchema.js";
import {v2  as cloudinary} from "cloudinary";


export const addNewSkill = catchAsyncErrors(async (req, res, next) => {

    if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("skills svg required", 400));
    }
    const { svg } = req.files;
    const { title, proficiency } = req.body;

    if (!title) {
        return next(new ErrorHandler("Skill title is required", 400));
    }

    if (!proficiency) {
        return next(new ErrorHandler("Skill proficiency is required", 400));
    }

    const cloudinaryResponseForSvg = await cloudinary.uploader.upload(
        svg.tempFilePath, {
         folder: "Portfolio_Skills_svgs"
        });

    if(!cloudinaryResponseForSvg || cloudinaryResponseForSvg.error) {
        console.error("Cloudinary upload error:", cloudinaryResponseForSvg.error || "Unknown error");
        return next(new ErrorHandler("Failed to upload SVG.", 500));
    }

    // Save the skill to the database
    const newSkill = await Skill.create({
        title,
        proficiency,
        svg: {
            public_id: cloudinaryResponseForSvg.public_id,
            url: cloudinaryResponseForSvg.secure_url
        }
    });

    res.status(201).json({
        success: true,
        message: "Skill added successfully",
        data: newSkill
    });
})

export const deleteSkill = catchAsyncErrors(async (req, res, next) => {

    const { id } = req.params;
    
    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
        return next(new Error("Skill not found", 400));
    }
    const skillSvgId = skill.svg.public_id;
    await cloudinary.uploader.destroy(skillSvgId);
    await skill.deleteOne();
    res.status(200).json({
        success: true,
        message: "Skill deleted successfully",
        data: {}
      });
});


export const updateSkill = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { proficiency } = req.body;

    // Validate input
    if (!proficiency) {
        return next(new ErrorHandler("Proficiency is required", 400));
    }

    // Find and update only the proficiency field
    const updatedSkill = await Skill.findByIdAndUpdate(
        id,
        { $set: { proficiency } },  // Only update proficiency
        { 
            new: true,               // Return the updated document
            runValidators: true      // Run schema validators
        }
    );

    if (!updatedSkill) {
        return next(new ErrorHandler("Skill not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Proficiency updated successfully",
        data: {
            _id: updatedSkill._id,
            title: updatedSkill.title,
            proficiency: updatedSkill.proficiency
        }
    });
});

export const getAllSkills = catchAsyncErrors(async (req, res, next) => {

    const skills = await Skill.find();

    res.status(200).json({
        success: true,
        message: "Skills retrieved successfully",
        data: skills
    });
})

