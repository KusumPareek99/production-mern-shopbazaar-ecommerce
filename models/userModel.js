import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: {}, required: true },
    answer: { type: String, required: true },
    role: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// this users below is the collection users in mogodb which was already created
export default mongoose.model("users", userSchema);
