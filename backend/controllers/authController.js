const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2. Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  // Delete all tasks belonging to this user
  await Task.deleteMany({ user: req.user._id });
  
  // Delete the user
  await User.findByIdAndDelete(req.user._id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
