import express from "express";
import Invite from "../models/Invite.js";
import crypto from "crypto";

const router = express.Router();

// Generate invite link
router.post("/create", async (req, res) => {
  const { inviter, room, invitee } = req.body;

  const token = crypto.randomBytes(20).toString("hex");

  const newInvite = await Invite.create({ inviter, invitee, token, room });

  res.json({
    inviteUrl: `http://localhost:5173/invite/${token}`
  });
});

// Accept invite
router.get("/:token", async (req, res) => {
  const token = req.params.token;
  const invite = await Invite.findOne({ token });

  if (!invite) return res.status(404).json({ message: "Invalid invite" });

  res.json({
    inviter: invite.inviter,
    room: invite.room
  });
});

export default router;
