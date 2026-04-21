import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Check localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false); // Finished checking
  }, []);
const login = (userData, userToken) => {
  // Update state
  setUser(userData);
  setToken(userToken);
  
  // Store in localStorage
  localStorage.setItem('token', userToken);
  localStorage.setItem('user', JSON.stringify(userData));
};
const logout = () => {
  // Clear state
  setUser(null);
  setToken(null);
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login
  navigate('/login');
};

const isAuthenticated = () => {
  return !!token && !!user;
};

const value = {
  user,
  token,
  loading,
  login,
  logout,
  isAuthenticated
};


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};