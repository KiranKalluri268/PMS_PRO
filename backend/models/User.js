const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  rollNumber: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "admin"], required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Certificate" }],
  isVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
