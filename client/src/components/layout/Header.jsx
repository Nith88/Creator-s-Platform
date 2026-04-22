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

const headerStyle = { backgroundColor: '#333', padding: '1rem' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoStyle = { color: 'white', textDecoration: 'none' };
const linkStyle = { color: 'white', textDecoration: 'none' };
const navLinkStyle = { color: 'white', textDecoration: 'none', marginRight: '1rem' };

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