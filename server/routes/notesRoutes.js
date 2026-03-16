const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Notes = require('../models/Notes');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX and TXT files are allowed'));
    }
    return cb(null, true);
  },
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;

    if (!title || !subject || !req.file) {
      return res.status(400).json({ message: 'Title, subject and file are required' });
    }

    const note = await Notes.create({
      title,
      subject,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
    });

    const populatedNote = await Notes.findById(note._id).populate('uploadedBy', 'name email');

    return res.status(201).json({ message: 'Note uploaded successfully', note: populatedNote });
  } catch (error) {
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

router.get('/notes', authMiddleware, async (_req, res) => {
  try {
    const notes = await Notes.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q?.trim() || '';

    const filter = query
      ? {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { subject: { $regex: query, $options: 'i' } },
          ],
        }
      : {};

    const notes = await Notes.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const absolutePath = path.join(__dirname, '..', note.fileUrl);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File no longer exists on the server' });
    }

    return res.download(absolutePath, note.fileName);
  } catch (error) {
    return res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

router.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size must be less than 10MB' });
    }
    return res.status(400).json({ message: error.message });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Unexpected upload error' });
});

module.exports = router;
