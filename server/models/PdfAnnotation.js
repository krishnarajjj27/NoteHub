const mongoose = require('mongoose');

const pdfAnnotationSchema = new mongoose.Schema(
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
    comment: {
      text: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500,
      },
      emoji: {
        type: String,
        default: '',
      },
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    position: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

pdfAnnotationSchema.index({ userId: 1, noteId: 1, createdAt: -1 });

module.exports = mongoose.model('PdfAnnotation', pdfAnnotationSchema);
