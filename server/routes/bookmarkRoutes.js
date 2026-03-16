const express = require('express');
const Bookmark = require('../models/Bookmark');
const Notes = require('../models/Notes');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/bookmark', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    const note = await Notes.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const existingBookmark = await Bookmark.findOne({ userId: req.user.id, noteId });
    if (existingBookmark) {
      return res.status(200).json({ message: 'Note already bookmarked', bookmark: existingBookmark });
    }

    const bookmark = await Bookmark.create({
      userId: req.user.id,
      noteId,
    });

    return res.status(201).json({ message: 'Note bookmarked successfully', bookmark });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to bookmark note', error: error.message });
  }
});

router.get('/bookmarks/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: user mismatch' });
    }

    const bookmarks = await Bookmark.find({ userId: req.user.id })
      .populate({
        path: 'noteId',
        populate: {
          path: 'uploadedBy',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    const notes = bookmarks
      .filter((bookmark) => bookmark.noteId)
      .map((bookmark) => ({
        ...bookmark.noteId.toObject(),
        bookmarkedAt: bookmark.createdAt,
      }));

    return res.status(200).json({
      notes,
      bookmarkedNoteIds: notes.map((note) => String(note._id)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch bookmarks', error: error.message });
  }
});

router.delete('/bookmark/:noteId', authMiddleware, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user.id,
      noteId: req.params.noteId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    return res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove bookmark', error: error.message });
  }
});

module.exports = router;
