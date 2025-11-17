import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Storage setup — local folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Upload single file
router.post("/single", upload.single("file"), (req, res) => {
  res.json({
    fileUrl: "/uploads/" + req.file.filename
  });
});

export default router;
