import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaArrowRightFromBracket } from 'react-icons/fa6';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" to={token ? '/dashboard' : '/'}>
          <FaBookOpen />
          <span>NoteHub</span>
        </Link>

        <nav className="nav-links">
          {!token && (
            <>
              <Link className={location.pathname === '/' ? 'active' : ''} to="/">
                Home
              </Link>
              <Link className={location.pathname === '/login' ? 'active' : ''} to="/login">
                Login
              </Link>
              <Link className={location.pathname === '/register' ? 'active' : ''} to="/register">
                Register
              </Link>
            </>
          )}

          {token && (
            <>
              <Link className={location.pathname === '/dashboard' ? 'active' : ''} to="/dashboard">
                Dashboard
              </Link>
              <Link className={location.pathname === '/upload' ? 'active' : ''} to="/upload">
                Upload
              </Link>
              <Link className={location.pathname === '/notes' ? 'active' : ''} to="/notes">
                Notes
              </Link>
              <Link className={location.pathname === '/bookmarks' ? 'active' : ''} to="/bookmarks">
                Bookmarks
              </Link>
              <button className="logout-btn" onClick={logout} type="button">
                <FaArrowRightFromBracket />
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
