const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Named import for v4.x
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
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
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

// Multer instances
const uploadVideo = multer({ storage: videoStorage });
const uploadDoc = multer({ storage: documentStorage });

// POST Upload Video to Cloudinary
router.post('/video', auth, (req, res) => {
  console.log('--- Starting Video Upload to Cloudinary ---');
  uploadVideo.single('video')(req, res, function (err) {
    if (err) {
      console.error('❌ Upload Error:', err);
      if (err.message && err.message.includes('uploader')) {
        return res.status(500).json({ 
          error: 'Cloudinary configuration error. Please check API keys.',
          details: err.message 
        });
      }
      return res.status(500).json({ error: 'Uplink failed: ' + err.message });
    }

    if (!req.file) {
      console.warn('⚠️ No file in request');
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log('✅ Video Upload Successful:', req.file.path);
    res.json({ url: req.file.path });
  });
});

// POST Upload PDF/Document to Cloudinary
router.post('/pdf', auth, (req, res) => {
  uploadDoc.single('pdf')(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Document sync failed: ' + err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No document provided' });
    }

    res.json({ url: req.file.path });
  });
});

module.exports = router;
