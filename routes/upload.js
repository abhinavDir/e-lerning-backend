const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { auth } = require('../middleware/auth');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Video Storage (Cloudinary)
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edstack/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
    public_id: (req, file) => `video-${Date.now()}`
  }
});

// PDF/Document Storage (Cloudinary)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edstack/documents',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt'],
    public_id: (req, file) => `doc-${Date.now()}`
  }
});

const uploadVideo = multer({ storage: videoStorage });
const uploadDoc = multer({ storage: documentStorage });

// POST Upload Video to Cloudinary
router.post('/video', auth, uploadVideo.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    // Return the secure Cloudinary URL
    res.json({ url: req.file.path }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Upload PDF/Document to Cloudinary
router.post('/pdf', auth, uploadDoc.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
