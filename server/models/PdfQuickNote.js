const mongoose = require('mongoose');

const pdfQuickNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notes',
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2500,
    },
  },
  {
    timestamps: true,
  }
);

pdfQuickNoteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

module.exports = mongoose.model('PdfQuickNote', pdfQuickNoteSchema);
