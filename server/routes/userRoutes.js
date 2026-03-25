const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notes = require('../models/Notes');
const Bookmark = require('../models/Bookmark');
const DownloadHistory = require('../models/DownloadHistory');
const PdfAnnotation = require('../models/PdfAnnotation');
const PdfQuickNote = require('../models/PdfQuickNote');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

function formatUserProfile(user) {
  return {
    id: user._id,
    fullName: user.name,
    email: user.email,
    profilePicture: user.profilePicture || '',
    bio: user.bio || '',
    collegeName: user.collegeName || '',
    courseDepartment: user.courseDepartment || '',
    yearSemester: user.yearSemester || '',
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'name email profilePicture bio collegeName courseDepartment yearSemester isVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ profile: formatUserProfile(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, profilePicture, bio, collegeName, courseDepartment, yearSemester } = req.body;

    const updates = {
      ...(fullName !== undefined ? { name: String(fullName).trim() } : {}),
      ...(profilePicture !== undefined ? { profilePicture: String(profilePicture).trim() } : {}),
      ...(bio !== undefined ? { bio: String(bio).trim() } : {}),
      ...(collegeName !== undefined ? { collegeName: String(collegeName).trim() } : {}),
      ...(courseDepartment !== undefined ? { courseDepartment: String(courseDepartment).trim() } : {}),
      ...(yearSemester !== undefined ? { yearSemester: String(yearSemester).trim() } : {}),
    };

    if (updates.name !== undefined && updates.name.length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters' });
    }

    if (updates.bio !== undefined && updates.bio.length > 300) {
      return res.status(400).json({ message: 'Bio must be at most 300 characters' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: 'name email profilePicture bio collegeName courseDepartment yearSemester isVerified createdAt',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: formatUserProfile(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validCurrentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

router.get('/profile/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, uploadedNotes, downloadedHistory, bookmarks, pdfAnnotations, pdfQuickNotesRaw] = await Promise.all([
      User.findById(userId).select(
        'name email profilePicture bio collegeName courseDepartment yearSemester isVerified createdAt'
      ),
      Notes.find({ uploadedBy: userId }).sort({ createdAt: -1 }).lean(),
      DownloadHistory.find({ userId })
        .populate({
          path: 'noteId',
          select: 'title subject fileName downloadCount uploadedBy createdAt',
          populate: { path: 'uploadedBy', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .lean(),
      Bookmark.find({ userId })
        .populate({
          path: 'noteId',
          select: 'title subject fileName downloadCount uploadedBy createdAt',
          populate: { path: 'uploadedBy', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .lean(),
      PdfAnnotation.find({ userId })
        .populate({ path: 'noteId', select: 'title subject fileName createdAt' })
        .sort({ createdAt: -1 })
        .lean(),
      PdfQuickNote.find({ userId })
        .populate({ path: 'noteId', select: 'title subject fileName createdAt' })
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalUploads = uploadedNotes.length;
    const totalDownloadsOnUserNotes = uploadedNotes.reduce(
      (sum, note) => sum + (note.downloadCount || 0),
      0
    );

    const mostPopularUploadedNote =
      uploadedNotes.length > 0
        ? uploadedNotes.reduce((best, current) =>
            (current.downloadCount || 0) > (best.downloadCount || 0) ? current : best
          )
        : null;

    const downloadedNotesHistory = downloadedHistory
      .filter((item) => item.noteId)
      .map((item) => ({
        downloadedAt: item.createdAt,
        note: item.noteId,
      }));

    const bookmarkedNotes = bookmarks
      .filter((bookmark) => bookmark.noteId)
      .map((bookmark) => ({
        bookmarkedAt: bookmark.createdAt,
        note: bookmark.noteId,
      }));

    const pdfHighlights = pdfAnnotations
      .filter((entry) => entry.noteId)
      .map((entry) => ({
        id: entry._id,
        savedAt: entry.createdAt,
        note: entry.noteId,
        comment: entry.comment?.text || '',
      }));

    const pdfQuickNotes = pdfQuickNotesRaw
      .filter((entry) => entry.noteId)
      .map((entry) => ({
        id: entry._id,
        updatedAt: entry.updatedAt,
        note: entry.noteId,
        text: entry.text || '',
      }));

    return res.status(200).json({
      profile: formatUserProfile(user),
      activity: {
        uploadedNotes,
        downloadedNotesHistory,
        bookmarkedNotes,
        pdfHighlights,
        pdfQuickNotes,
        totalUploadCount: totalUploads,
        totalDownloads: downloadedNotesHistory.length,
      },
      analytics: {
        uploadedNotesCount: totalUploads,
        totalDownloadsOnUserNotes,
        mostPopularUploadedNote,
        profileViews: null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch activity', error: error.message });
  }
});

module.exports = router;
