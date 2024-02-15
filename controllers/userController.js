// Route Handler Functions for Users

const User = require('../modal/usersModal');
const catchAsync = require('../utility/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ status: 'sucess', data: users });
});
exports.postUser = (req, res) => {
  res.status(500).json({ status: 'errror', message: 'Need to implement' });
};
exports.getUserById = (req, res) => {
  res.status(500).json({ status: 'errror', message: 'Need to implement' });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'errror', message: 'Need to implement' });
};
exports.updateUser = (req, res) => {
  res.status(500).json({ status: 'errror', message: 'Need to implement' });
};
