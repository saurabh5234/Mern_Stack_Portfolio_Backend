import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from"crypto";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true,"Name required"],
    },
    email: {
        type: String,
        required: [true,"email required"],
        unique: true
    },
    phone: {
        type: String,
        required: [true,"Phone number required"],
    },
    aboutMe: {
        type:String,
        required: [true,"About Me Field is required"]
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        minLength:[8,"Password must contain at least 8 characters!"],
        select:false,
    },
  avatar: {
    public_id: { type: String, required: true },
    url: { type: String, required: true }
  },
  resume: {  
    public_id: { type: String, required: true },
    url: { type: String, required: true }
  },
  
    portfolioURL:{
        type: String,
        require:[true, "Portfolio URL is required"]
    },
    githubURL:String,
    instagram:String,
    facebook:String,
    linkedin:String,
    twitter:String,
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

//For hashing password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});
//For comparing password with hash password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Generating JWT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    return resetToken;
};

export const User = mongoose.model("User", userSchema);