const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notes',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

downloadHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DownloadHistory', downloadHistorySchema);
