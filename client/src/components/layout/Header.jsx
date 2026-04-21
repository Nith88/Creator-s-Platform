import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <h1 style={logoStyle}>
          <Link to="/" style={linkStyle}>
            Your Platform Name
          </Link>
        </h1>

        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          
          {isAuthenticated() ? (
            <>
              <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
              <span style={userNameStyle}>Hi, {user.name}</span>
              <button onClick={logout} style={logoutBtnStyle}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle}>Login</Link>
              <Link to="/register" style={navLinkStyle}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

// Add these styles
const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
};

const userNameStyle = {
  color: 'white',
  fontSize: '0.9rem',
};

const logoutBtnStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Header;