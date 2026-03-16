import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      setError(requestError.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container page auth-layout">
        <section className="auth-card">
          <h2>Welcome Back</h2>
          <p>Login to access the notes dashboard.</p>

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
      </main>
    </>
  );
}

export default Login;
