import { useEffect, useMemo, useState } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import api from '../api';

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || '';
  } catch (_error) {
    return '';
  }
}

function Bookmarks() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkingNoteId, setBookmarkingNoteId] = useState('');

  async function fetchBookmarks() {
    const userId = getUserId();
    if (!userId) {
      setError('Unable to identify current user. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/bookmarks/${userId}`);
      setNotes(data.notes || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function handleDownload(noteId, fileName) {
    try {
      const response = await api.get(`/download/${noteId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note._id === noteId
            ? { ...note, downloadCount: (note.downloadCount || 0) + 1 }
            : note
        )
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Download failed');
    }
  }

  async function handleToggleBookmark(noteId) {
    setBookmarkingNoteId(noteId);
    setError('');

    try {
      await api.delete(`/bookmark/${noteId}`);
      setNotes((previousNotes) => previousNotes.filter((note) => note._id !== noteId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to remove bookmark');
    } finally {
      setBookmarkingNoteId('');
    }
  }

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading saved notes...';
    if (notes.length === 0) return 'No bookmarks yet. Save notes from the Notes page to see them here.';
    return '';
  }, [loading, notes.length]);

  return (
    <>
      <Navbar />
      <main className="container page">
        <section className="panel">
          <div className="panel-row">
            <h2>
              <FaBookmark /> Saved Notes ({notes.length})
            </h2>
            <button type="button" className="btn-secondary" onClick={fetchBookmarks}>
              Refresh
            </button>
          </div>

          <p className="helper-text">Your bookmarked notes are available here for quick access.</p>

          {error && <p className="error-text">{error}</p>}
          {emptyMessage && <p className="helper-text">{emptyMessage}</p>}

          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onDownload={handleDownload}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked
                bookmarkLoading={bookmarkingNoteId === note._id}
              />
            ))}
          </div>

          {!loading && notes.length > 0 && (
            <div className="saved-note-summary">
              <FaRegBookmark /> Keep adding useful notes from the Notes tab to build your study list.
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Bookmarks;
