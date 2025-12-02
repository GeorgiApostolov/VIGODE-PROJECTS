import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true }, // YYYY-MM-DD
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.News || mongoose.model("News", NewsSchema);
