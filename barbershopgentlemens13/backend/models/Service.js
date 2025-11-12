import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, default: 30 }, // мин.
  description: { type: String, default: "" }
});

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
