const { catchAsyncError } = require("../middleware/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const { sendEmail } = require("../utils/sendEmail");
const { sendToken } = require("../utils/sendToken");
const Course = require('../models/Course');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const getDatAUri = require("../utils/dataUri");

exports.register = catchAsyncError(async (req, res, next) => {
    const { name , email, password } = req.body;
    const file = req.file;
    if(!name || !email || !password || !file){
        return next(new ErrorHandler("Please Enter All Fields", 400));
    }

    let user = await User.findOne({email});
    if(user){
        return next(new ErrorHandler("User Already Exists", 409))
    }
    //upload files on cloudinary
    
    const fileUri = getDatAUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    user = await User.create({
        name, email, password , avatar:{public_id : mycloud.public_id , url: mycloud.secure_url}
    })

    sendToken(res, user, "Regsteration Sucessfully", 201);
})

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please Enter All Field", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user) {
        return next(new ErrorHandler("Incorrect email or password", 401))
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch) {
        return next(new ErrorHandler("Incorrect email or password", 401))
    }
    sendToken(res, user, `Welcome back ${user.name}`, 200)
})

exports.logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null , {
        expires: new Date(Date.now()),
        httpOnly: true, 
        secure: true, 
        sameSite: "none"
    }).json({
        success: true,
        message: "Logout Successfully"
    })
})

exports.getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        user
    })
})

exports.changePassword = catchAsyncError(async (req, res, next) => {
    const {oldPassword , newPassword} = req.body;
    if(!oldPassword || !newPassword){
        return next(new ErrorHandler("Please enter all fields", 400))
    }
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);
    if(!isMatch){
        return next(new ErrorHandler("Incorrect Old Password", 400))
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "password changed successfully"
    })
})

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const {name, email} = req.body;
    const user = await User.findById(req.user._id);
    if(name){
        user.name = name;
    }
    if(email){
        user.email = email;
    }
    await user.save();
    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully"
    })
})

exports.updateProfilePicture = catchAsyncError(async (req, res, next) =>{
    const user = await User.findById(req.user._id);

    const file = req.file;
    const fileUri = getDatAUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
        public_id: mycloud.public_id,
        url:mycloud.secure_url
    }
    await user.save();
    res.status(200).json({
        success: true,
        message: "Profile Picture Updated Successfully"
    })
})

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return next(new ErrorHandler("User not found", 400))
    }
    const resetToken = await user.getResetToken();
    await user.save();
    /**reset token via email */
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    const message = `Click on the link to reset your password. ${url}, if you have not request then please ignore`
    await sendEmail(user.email, "CourseBundler Reset Password", message)
    res.status(200).json({
        success: true,
        message:`Reset token has been sent to ${user.email}`
    })
})

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const {token} = req.params;
    const resetPasswordToken =  crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
        }
    })
    if(!user){
        return next(new ErrorHandler("Token is invalid or has been expired"))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message:"Password changed sucessfully"
    })
})

exports.addtoPlayList = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);
    if(!course){
        return next(new ErrorHandler("Invalid cousre ID", 404))
    }
    const exitsItem = user.playlist.find((item)=>{
        if(item.course.toString() === course._id.toString()){
            return true
        }
    })
    if(exitsItem) return next(new ErrorHandler("Item Already Exists", 409))
    user.playlist.push({
        course:course._id,
        poster:course.poster.url
    })
    await user.save();
    res.status(200).json({
        success: true,
        message: "Add to Playlist"
    })
})

exports.removetoPlayList = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);
    if(!course){
        return next(new ErrorHandler("Invalid cousre ID", 404))
    }
    const newItem = user.playlist.filter((item) => {
        if(item.course.toString() !== course._id.toString()) return item;
    })
    user.playlist = newItem;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Remove to Playlist"
    })
})

exports.deleteMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    /**canncel subscription */
    await user.remove();
    res.status(200).cookie("token", null , {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "My profile deleted successfully"
    })
})


/**Admin controllers */

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
})

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler("User does not exits", 404))
    }
    if(user.role === "user") user.role = "admin"
    else user.role = "user"
    await user.save();
    res.status(200).json({
        success: true,
        message:"Role Updated"
    })
})

exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler("User does not exist",404))
    }
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    /**canncel subscription */
    await user.remove();
    res.status(200).json({
        success: true,
        message:"Delete user successfully"
    })
})