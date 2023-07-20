const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        aboutMe: req.body?.aboutMe,
        username: req.body.username,
    });

    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) if the email and password are there
    if (!email || !password)
        return next(new AppError('Please give email and password !', 404));

    // 2) if a user exists with your given email and if yes then password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect email or password !', 404));

    createSendToken(user, 201, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) get token and check if its there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('No cookies found !', 404));
    }
    // 2) verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) check if the user still exists
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('No such user found !', 404));
    // 4) Grant access to protected route
    req.user = user;
    res.locals.user = user;
    next();
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    res.status(statusCode).json({
        status: 'success',
        message: 'loggedOut',
    });
});
