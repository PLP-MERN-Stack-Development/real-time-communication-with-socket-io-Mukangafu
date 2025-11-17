import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  inviter: { type: String, required: true },
  invitee: { type: String, required: false }, // username if targeted
  token: { type: String, required: true },
  room: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Invite", InviteSchema);
