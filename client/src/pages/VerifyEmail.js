import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || '';
  const [form, setForm] = useState({ email: initialEmail, code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleVerify(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.post('/verify-email', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!form.email) {
      setError('Please enter your email first.');
      return;
    }

    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const { data } = await api.post('/resend-verification', { email: form.email });
      setSuccess(data.message || 'Verification code sent.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container page auth-layout">
        <section className="auth-card">
          <h2>Verify Email</h2>
          <p>Enter the 6-digit code sent to your email address.</p>

          <form onSubmit={handleVerify} className="form-grid">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={form.code}
              onChange={handleChange}
              required
            />

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button disabled={loading} type="submit" className="btn-primary block-btn">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="inline-actions">
            <button type="button" className="btn-secondary" onClick={handleResendCode} disabled={resendLoading}>
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          <p className="helper-text">
            Already verified? <Link to="/login">Back to Login</Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default VerifyEmail;
