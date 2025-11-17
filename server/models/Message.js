import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },   // username
    receiver: { type: String, default: null },  // DM target (null for rooms)
    room: { type: String, default: null },      // room name (null for DMs)

    message: { type: String, default: "" },     // text content
    type: { type: String, default: "text" },    // text, image, file, voice, system
    fileUrl: { type: String, default: null },   // uploaded file

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model("Message", MessageSchema);
