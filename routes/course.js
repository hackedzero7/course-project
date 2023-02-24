const express = require("express");
const { getAllCourses, createCourse, getCourseLetures, addLetures, deleteCourse, deleteLecture } = require("../controllers/course");
const { autherizeAdmin, isAuthenticated } = require("../middleware/auth");
const singleUpload = require("../middleware/multer");

const router = express.Router();
router.route('/courses').get(getAllCourses);
router.route('/createcourse').post(isAuthenticated, autherizeAdmin, singleUpload, createCourse);
router.route('/course/:id').get(isAuthenticated, getCourseLetures).post(isAuthenticated,autherizeAdmin, singleUpload, addLetures).delete(isAuthenticated, autherizeAdmin, deleteCourse)
router.route('/lecture').delete(isAuthenticated, autherizeAdmin, deleteLecture);
module.exports = router;