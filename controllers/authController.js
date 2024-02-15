const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utility/catchAsync.js');
const User = require('./../modal/usersModal.js');
const AppError = require('../utility/appError.js');

const signToken = function(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // const newuser = await User.create(req.body);
  const newuser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordconfirm
  });

  const token = signToken(newuser._id);
  res.status(201).json({ status: 'success', token, data: { user: newuser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please enter a email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('invalid password or email', 401));
  }
  const token = signToken(user._id);
  res.status(201).json({ status: 'success', token, data: { user: user } });
});

exports.protect = catchAsync(async function(req, res, next) {
  let token;
  console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  //verification

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  next();
});
