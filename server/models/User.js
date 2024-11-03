// server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Converts to lowercase
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Ensures password has a minimum length
  },
  profilePicture: {
    type: String, // URL to the profile picture
    default: '', // Default empty string if no picture is provided
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
