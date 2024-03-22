const mongoose = require("mongoose");

const loginLogsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    requestMethod: {
      type: String,
    },
    requestUrl: {
      type: String,
    },
    requestHeaders: {
      type: Object,
    },
    requestQuery: {
      type: Object,
    },
    requestBody: {
      type: Object,
    },
    requestCookies: {
      type: Object,
    },
    requestProtocol: {
      type: String,
    },
    requestHost: {
      type: String,
    },
    requestPath: {
      type: String,
    },
    requestParams: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginLogs", loginLogsSchema);
