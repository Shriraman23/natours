const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userScheme = new mongoose.Schema({
  name: { type: String, required: [true, 'A username must be given'] },
  email: {
    type: String,
    required: [true, 'Email required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail]
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordconfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: 'Passwords do not match'
    }
  }
});

userScheme.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordconfirm = undefined;
  next();
});

userScheme.methods.correctPassword = async function(typedpass, actualuser) {
  return await bcrypt.compare(typedpass, actualuser);
};

const User = mongoose.model('User', userScheme);
module.exports = User;
