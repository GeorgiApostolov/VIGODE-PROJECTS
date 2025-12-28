import mongoose from "mongoose";

const DayOffSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barber",
      default: null,
    },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

DayOffSchema.index({ date: 1, barberId: 1 }, { unique: true, sparse: true });

export default mongoose.models.DayOff || mongoose.model("DayOff", DayOffSchema);
