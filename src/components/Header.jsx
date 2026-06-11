import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">FIFA</span>
          <span className="brand-text">
            <span className="brand-title">World Cup 2026</span>
            <span className="brand-sub">USA · Mexico · Canada</span>
          </span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/matches">Matches</NavLink>
          {currentUser && (
            <>
              <NavLink to="/my-tickets">My Tickets</NavLink>
              <NavLink to="/transfer">Transfer</NavLink>
            </>
          )}
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-greeting">
                <span className="user-avatar">{currentUser.name.charAt(0)}</span>
                {currentUser.name.split(' ')[0]}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-gold btn-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}