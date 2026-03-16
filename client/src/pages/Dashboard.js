import { Link } from 'react-router-dom';
import { FaCloudArrowUp, FaBookOpenReader, FaMagnifyingGlass, FaArrowTrendUp } from 'react-icons/fa6';
import Navbar from '../components/Navbar';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      <Navbar />
      <main className="container page">
        <section className="panel">
          <div className="dashboard-head">
            <div>
              <p className="eyebrow">Workspace</p>
              <h2>Welcome, {user.name || 'Student'}</h2>
              <p>
                Share your resources, discover notes by subject, and keep your preparation efficient and
                organized.
              </p>
            </div>
            <div className="quick-stats">
              <div className="stat-box">
                <FaCloudArrowUp />
                <span>Upload Notes</span>
              </div>
              <div className="stat-box">
                <FaMagnifyingGlass />
                <span>Search Smartly</span>
              </div>
              <div className="stat-box">
                <FaArrowTrendUp />
                <span>Study Faster</span>
              </div>
            </div>
          </div>

          <div className="grid-two">
            <Link className="action-card" to="/upload">
              <FaCloudArrowUp />
              <div>
                <h3>Upload Notes</h3>
                <p>Add title, subject, description and study file in one step.</p>
              </div>
            </Link>

            <Link className="action-card" to="/notes">
              <FaBookOpenReader />
              <div>
                <h3>View Notes</h3>
                <p>Browse, filter and download shared notes instantly.</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
