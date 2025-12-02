import mongoose from "mongoose";

const WorkHourOverrideSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barber",
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: {
      type: String,
      enum: ["range", "specific"], // range = от-до, specific = конкретни часове
      required: true,
    },
    // За range тип
    startTime: { type: String }, // HH:MM
    endTime: { type: String }, // HH:MM
    // За specific тип
    availableTimes: [{ type: String }], // ["13:00", "14:50", "16:10"]
  },
  { timestamps: true }
);

// Индекс за бързо търсене по барбер и дата
WorkHourOverrideSchema.index({ barberId: 1, date: 1 });

export default mongoose.models.WorkHourOverride ||
  mongoose.model("WorkHourOverride", WorkHourOverrideSchema);
