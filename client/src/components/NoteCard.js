import {
  FaFileArrowDown,
  FaFolderOpen,
  FaUserGraduate,
  FaCalendarDays,
  FaDownload,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa6';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function readableSize(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function NoteCard({ note, onDownload, onToggleBookmark, isBookmarked = false, bookmarkLoading = false }) {
  return (
    <article className="note-card">
      <div className="note-header">
        <h3>{note.title}</h3>
        <span className="badge">{note.subject}</span>
      </div>

      <p className="note-description">{note.description || 'No description provided.'}</p>

      <div className="note-meta">
        <span>
          <FaUserGraduate /> {note.uploadedBy?.name || 'Unknown'}
        </span>
        <span>
          <FaCalendarDays /> {formatDate(note.createdAt)}
        </span>
        <span>
          <FaFolderOpen /> {readableSize(note.fileSize)}
        </span>
        <span className="download-count">
          <FaDownload /> Downloads: {note.downloadCount || 0}
        </span>
      </div>

      <div className="note-actions">
        {onToggleBookmark && (
          <button
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => onToggleBookmark(note._id)}
            type="button"
            disabled={bookmarkLoading}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            {bookmarkLoading ? 'Saving...' : isBookmarked ? 'Saved' : 'Bookmark'}
          </button>
        )}

        <button className="download-btn" onClick={() => onDownload(note._id, note.fileName)} type="button">
          <FaFileArrowDown /> Download
        </button>
      </div>
    </article>
  );
}

export default NoteCard;
