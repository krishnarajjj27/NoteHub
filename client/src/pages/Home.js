import { Link } from 'react-router-dom';
import {
  FaArrowRightLong,
  FaCloudArrowUp,
  FaMagnifyingGlass,
  FaDownload,
  FaShieldHalved,
  FaClock,
  FaDatabase,
  FaBolt,
} from 'react-icons/fa6';
import Navbar from '../components/Navbar';

function Home() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">NoteHub</p>
            <h1>Study Smarter with Shared Academic Notes</h1>
            <p>
              Built for students who want fast access to quality materials. Upload notes, discover content by
              subject, and keep everything organized in one place.
            </p>

            <div className="hero-points">
              <span>
                <FaBolt /> Fast onboarding
              </span>
              <span>
                <FaShieldHalved /> Secure user access
              </span>
              <span>
                <FaMagnifyingGlass /> Powerful search
              </span>
            </div>

            <div className="cta-row">
              <Link className="btn-primary" to="/register">
                Get Started <FaArrowRightLong />
              </Link>
              <Link className="btn-secondary" to="/login">
                Login
              </Link>
            </div>
          </div>
          <div className="hero-panel">
            <h3>Platform Highlights</h3>
            <div className="feature-item">
              <FaCloudArrowUp />
              <span>Upload PDF and document notes with metadata</span>
            </div>
            <div className="feature-item">
              <FaMagnifyingGlass />
              <span>Smart search by title and subject</span>
            </div>
            <div className="feature-item">
              <FaDownload />
              <span>Fast, one-click secure download</span>
            </div>
            <div className="feature-item">
              <FaShieldHalved />
              <span>Protected APIs with JWT authentication</span>
            </div>
          </div>
        </section>

        <section className="highlights-grid">
          <article className="highlight-card">
            <FaClock />
            <h3>Save Study Time</h3>
            <p>Find consolidated notes quickly instead of collecting materials from multiple channels.</p>
          </article>

          <article className="highlight-card">
            <FaDatabase />
            <h3>Centralized Repository</h3>
            <p>All uploaded files and metadata are organized in one structured and searchable platform.</p>
          </article>

          <article className="highlight-card">
            <FaShieldHalved />
            <h3>Secure By Default</h3>
            <p>Authentication and protected routes keep uploads and downloads limited to verified users.</p>
          </article>
        </section>
      </main>
    </>
  );
}

export default Home;
