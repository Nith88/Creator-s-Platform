
import express from 'express';
import multer from 'multer';

import cloudinary from '../config/cloudinary.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/* 📦 MULTER MEMORY STORAGE */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/* ☁️ CLOUDINARY BUFFER UPLOAD */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'creator-platform'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });
};

/* 🚀 POST IMAGE UPLOAD */
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      /* 1️⃣ CHECK FILE */
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      /* 2️⃣ UPLOAD BUFFER TO CLOUDINARY */
      const result = await uploadToCloudinary(req.file.buffer);

      /* 3️⃣ RETURN IMAGE DATA */
      res.status(200).json({
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id
      });

    } catch (error) {
      console.error('❌ Upload Error:', error);

      res.status(500).json({
        success: false,
        message: 'Image upload failed'
      });
    }
  }
);

export default router;
