// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['telecaller', 'marketing', 'officer', 'admin'],
      default: 'telecaller',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
