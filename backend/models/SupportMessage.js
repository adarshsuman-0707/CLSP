const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true, trim: true },
    senderEmail: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null if submitted by unauthenticated user
    },
    status: {
      type: String,
      enum: ["pending", "replied"],
      default: "pending",
    },
    replyText: { type: String, default: "" },
    repliedAt: { type: Date, default: null },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
