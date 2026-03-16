import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaShieldHalved, FaCloudArrowUp } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import api from '../api';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (requestError) {
      if (requestError.response?.data?.requiresVerification) {
        navigate('/verify-email', { state: { email: form.email } });
        return;
      }
      setError(requestError.response?.data?.message || 'Login failed');
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
            <h2>Welcome Back</h2>
            <p>Login to access your dashboard and saved notes.</p>

            <form onSubmit={handleSubmit} className="form-grid">
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
                required
              />

              {error && <p className="error-text">{error}</p>}

              <button disabled={loading} type="submit" className="btn-primary block-btn">
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <p className="helper-text">
              New user? <Link to="/register">Create account</Link>
            </p>
          </section>

          <aside className="auth-side-panel">
            <h3>Why students choose NoteHub</h3>
            <div className="auth-side-item">
              <FaBookOpen />
              <span>Organized notes across subjects</span>
            </div>
            <div className="auth-side-item">
              <FaCloudArrowUp />
              <span>Quick upload and sharing flow</span>
            </div>
            <div className="auth-side-item">
              <FaShieldHalved />
              <span>Account-secure learning workspace</span>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

export default Login;
