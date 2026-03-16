import { useEffect, useMemo, useState } from 'react';
import { FaMagnifyingGlass, FaArrowTrendUp, FaDownload } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import api from '../api';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [bookmarkedNoteIds, setBookmarkedNoteIds] = useState(new Set());
  const [bookmarkingNoteId, setBookmarkingNoteId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || '';
    } catch (_error) {
      return '';
    }
  }

  async function fetchBookmarks() {
    const userId = getCurrentUserId();
    if (!userId) {
      return;
    }

    try {
      const { data } = await api.get(`/bookmarks/${userId}`);
      setBookmarkedNoteIds(new Set(data.bookmarkedNoteIds || []));
    } catch (_requestError) {
      setBookmarkedNoteIds(new Set());
    }
  }

  async function fetchAllNotes() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllNotes();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const endpoint = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/notes';
        const { data } = await api.get(endpoint);
        setNotes(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Search failed');
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

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
      const isBookmarked = bookmarkedNoteIds.has(noteId);
      if (isBookmarked) {
        await api.delete(`/bookmark/${noteId}`);
        setBookmarkedNoteIds((previousIds) => {
          const nextIds = new Set(previousIds);
          nextIds.delete(noteId);
          return nextIds;
        });
      } else {
        await api.post('/bookmark', {
          userId: getCurrentUserId(),
          noteId,
        });
        setBookmarkedNoteIds((previousIds) => {
          const nextIds = new Set(previousIds);
          nextIds.add(noteId);
          return nextIds;
        });
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update bookmark');
    } finally {
      setBookmarkingNoteId('');
    }
  }

  const topDownloadedNotes = useMemo(
    () => [...notes].sort((first, second) => (second.downloadCount || 0) - (first.downloadCount || 0)).slice(0, 3),
    [notes]
  );

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading notes...';
    if (notes.length === 0) return 'No notes found. Try another search or upload new notes.';
    return '';
  }, [loading, notes.length]);

  return (
    <>
      <Navbar />
      <main className="container page">
        <section className="panel">
          <div className="panel-row">
            <h2>All Notes</h2>
            <button type="button" className="btn-secondary" onClick={fetchAllNotes}>
              Refresh
            </button>
          </div>

          <div className="search-wrap">
            <FaMagnifyingGlass />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or subject"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {emptyMessage && <p className="helper-text">{emptyMessage}</p>}

          {topDownloadedNotes.length > 0 && (
            <section className="top-notes-panel" aria-label="Top downloaded notes">
              <div className="top-notes-head">
                <h3>
                  <FaArrowTrendUp /> Top Downloaded Notes
                </h3>
              </div>
              <div className="top-notes-list">
                {topDownloadedNotes.map((note, index) => (
                  <div key={note._id} className="top-note-item">
                    <div className="top-note-rank">{index + 1}</div>
                    <div className="top-note-copy">
                      <p>{note.title}</p>
                      <span>{note.subject}</span>
                    </div>
                    <div className="top-note-downloads">
                      <FaDownload /> {note.downloadCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onDownload={handleDownload}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedNoteIds.has(note._id)}
                bookmarkLoading={bookmarkingNoteId === note._id}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default NotesList;
