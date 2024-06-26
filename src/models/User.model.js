const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    login_otp: {
      type: String,
      default: null, // Stores the login OTP
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);