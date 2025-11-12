// models/GalleryItem.js
import mongoose from "mongoose";

const GalleryItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },       // Imgur линк
    caption: { type: String, default: "" },           // по желание
    tags: { type: [String], default: [] },            // ["fade","beard"] например
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", default: null },
    sortOrder: { type: Number, default: 0 },          // за подредба
    isVisible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.GalleryItem || mongoose.model("GalleryItem", GalleryItemSchema);
