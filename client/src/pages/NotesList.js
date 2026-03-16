import { useEffect, useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import api from '../api';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Download failed');
    }
  }

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

          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onDownload={handleDownload} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default NotesList;
