// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    profilePhoto: { type: String, default: null }, // <-- НОВО
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
