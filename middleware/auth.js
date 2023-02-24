const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const { catchAsyncError } = require('./catchAsyncError');

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Login First"), 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    next();
})

exports.autherizeAdmin = (req, res, next) => {
    if(req.user.role !==  "admin"){
        return next(new ErrorHandler(`${req.user.role} is not allowed to acces this resource`, 403))
    }
    next();
}