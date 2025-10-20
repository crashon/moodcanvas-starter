const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/media';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and videos
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed!'));
        }
    }
});

// Upload single file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileInfo = {
            id: uuidv4(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            url: `/uploads/media/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
            uploadedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: fileInfo
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const filesInfo = req.files.map(file => ({
            id: uuidv4(),
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            url: `/uploads/media/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
            type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            uploadedAt: new Date().toISOString()
        }));

        res.json({
            success: true,
            message: `${filesInfo.length} files uploaded successfully`,
            data: filesInfo
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// Get all media files
router.get('/', async (req, res) => {
    try {
        const uploadDir = 'uploads/media';
        if (!fs.existsSync(uploadDir)) {
            return res.json({
                success: true,
                data: []
            });
        }

        const files = fs.readdirSync(uploadDir);
        const mediaFiles = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            
            return {
                id: filename.split('-')[0],
                filename: filename,
                url: `/uploads/media/${filename}`,
                size: stats.size,
                uploadedAt: stats.birthtime.toISOString(),
                type: filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video'
            };
        });

        res.json({
            success: true,
            data: mediaFiles
        });
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get media files',
            error: error.message
        });
    }
});

// Delete media file
router.delete('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join('uploads/media', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error.message
        });
    }
});

module.exports = router;
