const { catchAsyncError } = require("../middleware/catchAsyncError")
const Course = require("../models/Course");
const getDatAUri = require("../utils/dataUri");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require('cloudinary');

exports.getAllCourses = catchAsyncError(async (req, res, next) => {
    const courses = await Course.find().select("-lectures");
    res.status(200).json({
        success: true,
        courses
    })
})


exports.createCourse = catchAsyncError(async (req, res, next) => {
    const {title, description , category , createdBy} = req.body;
    if(!title || !description || !category || !createdBy){
        return next(new ErrorHandler("Please Add All Feilds", 404))
    }
    const file = req.file;
    const fileUri = getDatAUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)
    await Course.create({
        title, description, category, createdBy, poster:{public_id: mycloud.public_id, url: mycloud.secure_url}
    })

    res.status(201).json({
        success: true, 
        message: "Course Created Successfully"
    })
})

exports.getCourseLetures = catchAsyncError(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if(!course){
        return next(new ErrorHandler("Course not found" ,404))
    }
    course.views+=1;
    await course.save();
    res.status(200).json({
        success: true,
        lectures: course.lectures
    })
})


exports.addLetures = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    const {title , description} = req.body;
    // const file = req.file;
    const course = await Course.findById(id);
    if(!course){
        return next(new ErrorHandler("Course not found" ,404))
    }
    const file = req.file;
    const fileUri = getDatAUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type:"video"
    })
    course.lectures.push({
        title,
        description,
        video:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        }
    })
    course.numOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
        success: true,
        lectures: "Lecture add in the course"
    })
})


exports.deleteCourse = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    const course = await Course.findById(id);
    if(!course) {
        return next(new ErrorHandler("Course not found", 404))
    }
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    for(let i=0; i < course.lectures.length; i++){
        const singleLecture = course.lectures[i];
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
            resource_type: "video"
        });
    }
    await course.remove();
    res.status(201).json({
        success: true, 
        message: "Course Deleted Successfully"
    })
})


exports.deleteLecture = catchAsyncError(async (req, res, next) => {
    const {courseId, lectureId} = req.query;
    const course = await Course.findById(courseId);
    if(!course) {
        return next(new ErrorHandler("Course not found", 404))
    }
 
    const lecture = course.lectures.find((item) => {
        if(item._id.toString() === lectureId.toString()){
            return item;
        }
    })
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
        resource_type: "video"
    })
    course.lectures = course.lectures.filter((item) => {
        if(item._id.toString() !== lectureId.toString()){
            return item;
        }
    })

    course.numOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
        success: true, 
        message: "Message deleted Successfully"
    })
})