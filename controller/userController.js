import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// Handle file upload and user registration logic here

export const register = catchAsyncErrors(async (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("No files were uploaded.", 400));
    }
    const { avatar } = req.files;

    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath, {
         folder: "AVATARS"
});
    if(!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error("Cloudinary upload error:", cloudinaryResponseForAvatar.error || "Unknown error");
        return next(new ErrorHandler("Failed to upload avatar.", 500));
    }

    const {resume } = req.files;

    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath, {
            folder: "MY_RESUME"
        });
    if(!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
        console.error("Cloudinary upload error:", cloudinaryResponseForResume.error || "Unknown error");
        return next(new ErrorHandler("Failed to upload resume.", 500));
    }

    // Create user in the database
    const user = await User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        password: req.body.password,
        avatar: {
            public_id: cloudinaryResponseForAvatar.public_id,
            url: cloudinaryResponseForAvatar.secure_url
        },
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        linkedin: req.body.linkedin,
        twitter: req.body.twitter,
        resume: {
            public_id: cloudinaryResponseForResume.public_id,
            url: cloudinaryResponseForResume.secure_url
        }
    });

   generateToken(user, "User registered successfully", 201, res);
});

//login function

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
     
    if(!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    generateToken(user, "User logged in successfully", 200, res);
});

//logout function

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "None",
    secure: true
  })
  .json({
    success: true,
    message: "Logged out successfully"
  });
});

//getuser function

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user
  });
});

//update profile

export const updateProfile = catchAsyncErrors(async (req, res, next) => {

const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    instagram: req.body.instagram,
    facebook: req.body.facebook,
    linkedin: req.body.linkedin,
    twitter: req.body.twitter
  };

 if(req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath, {
            folder: "AVATARS"
        }
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary upload error:", cloudinaryResponse.error || "Unknown error");
        return next(new ErrorHandler("Failed to upload avatar.", 500));
    }

    newUserData.avatar = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url
    };
}   

//for resume
    if (req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await User.findById(req.user.id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath, {
                folder: "RESUMES"
            }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error("Cloudinary upload error:", cloudinaryResponse.error || "Unknown error");
            return next(new ErrorHandler("Failed to upload resume.", 500));
        }

        newUserData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});

//update password

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please provide all password fields", 400));
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const isCurrentPasswordMatched = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordMatched) {
        return next(new ErrorHandler("current password is incorrect", 401));
    }

    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("New password and confirm password do not match", 400));
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

//get portfolio
export const getUserPortfolio = catchAsyncErrors(async (req, res, next) => {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        portfolio: user.portfolio
    });
});

//forget password

export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
 
    // Generate a reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Send email with reset token
    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    const message = `Reset your password by clicking on the following link: \n\n ${resetPasswordUrl}\n\nIf you did not request this email, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset",
            message
        });
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully!`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Email could not be sent", 500));
    }
});

//Reset password

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
const { token } = req.params;
const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
});
if (!user) {
    return next(new ErrorHandler("Reset password token is invalid or has expired", 400));
}
if(req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
}

user.password = req.body.password;
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;
await user.save();

generateToken(user, "Reset Password successfully!",200,res);
});