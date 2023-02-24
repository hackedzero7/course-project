const express = require("express");
const { register, login, logout, getMyProfile, changePassword, updateProfile, forgetPassword, resetPassword, addtoPlayList, removetoPlayList, updateProfilePicture, getAllUsers, updateUserRole, deleteUser, deleteMyProfile } = require("../controllers/user");
const { isAuthenticated, autherizeAdmin } = require("../middleware/auth");
const singleUpload = require("../middleware/multer");

const router = express.Router();

router.route('/register').post(singleUpload, register);
router.route('/login').post(login);
router.route('/me').get(isAuthenticated, getMyProfile).delete(isAuthenticated, deleteMyProfile)
router.route('/changepassword').put(isAuthenticated, changePassword);
router.route('/updateprofile').put(isAuthenticated, updateProfile);
router.route('/updateprofilepicture').put(isAuthenticated, singleUpload, updateProfilePicture);
router.route('/forgetpassword').post(forgetPassword);
router.route('/resetpassword/:token').put(resetPassword);
router.route('/addtoplaylist').post(isAuthenticated, addtoPlayList);
router.route('/removetoplaylist').delete(isAuthenticated, removetoPlayList);
router.route('/admin/users').get(isAuthenticated, autherizeAdmin, getAllUsers);
router.route('/admin/user/:id').put(isAuthenticated, autherizeAdmin, updateUserRole).delete(isAuthenticated, autherizeAdmin,deleteUser)
router.route('/logout').get(logout);

module.exports = router;