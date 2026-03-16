import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

function UploadNotes() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', subject: '', description: '', file: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value, files } = event.target;
    if (name === 'file') {
      setForm((prev) => ({ ...prev, file: files?.[0] || null }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.file) {
      setError('Please select a file to upload.');
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('subject', form.subject);
    payload.append('description', form.description);
    payload.append('file', form.file);

    setLoading(true);
    try {
      await api.post('/upload', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Note uploaded successfully. Redirecting to notes list...');
      setForm({ title: '', subject: '', description: '', file: null });
      setTimeout(() => navigate('/notes'), 800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container page">
        <section className="panel">
          <h2>Upload Notes</h2>
          <p>Allowed formats: PDF, DOC, DOCX, PPT, PPTX, TXT. Max file size: 10MB.</p>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} required />

            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" value={form.subject} onChange={handleChange} required />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
            />

            <label htmlFor="file">File</label>
            <input id="file" name="file" type="file" onChange={handleChange} required />

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button className="btn-primary block-btn" disabled={loading} type="submit">
              {loading ? 'Uploading...' : 'Upload Note'}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default UploadNotes;
