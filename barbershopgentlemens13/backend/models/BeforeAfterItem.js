// models/BeforeAfterItem.js
import mongoose from "mongoose";

const BeforeAfterItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },             // например "Fade + брада"
    beforeUrl: { type: String, required: true },      // Imgur (before)
    afterUrl: { type: String, required: true },       // Imgur (after)
    tags: { type: [String], default: [] },
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", default: null },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.BeforeAfterItem || mongoose.model("BeforeAfterItem", BeforeAfterItemSchema);
