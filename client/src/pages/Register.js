import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBookmark, FaArrowTrendUp, FaMagnifyingGlass } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import api from '../api';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.post('/register', form);
      setSuccess(data.message || 'Registration successful. Verify your email.');
      setTimeout(() => {
        navigate('/verify-email', { state: { email: form.email } });
      }, 600);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container page auth-layout">
        <section className="auth-shell">
          <section className="auth-card">
            <h2>Create Account</h2>
            <p>Register to upload and share your study notes.</p>

            <form onSubmit={handleSubmit} className="form-grid">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                minLength={6}
                required
              />

              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              <button disabled={loading} type="submit" className="btn-primary block-btn">
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="helper-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </section>

          <aside className="auth-side-panel">
            <h3>Start your study workspace</h3>
            <div className="auth-side-item">
              <FaBookmark />
              <span>Save important notes for revision</span>
            </div>
            <div className="auth-side-item">
              <FaMagnifyingGlass />
              <span>Search by title and subject quickly</span>
            </div>
            <div className="auth-side-item">
              <FaArrowTrendUp />
              <span>Track top downloaded resources</span>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

export default Register;
