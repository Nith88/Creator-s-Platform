import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import Header from './components/layout/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        <AuthProvider>
          <div style={appStyle}>
            {/* Header appears on all pages */}
            <Header />

            {/* Main content area */}
            <main style={mainStyle}>
              <Routes>
                {/* Define your routes here */}
                <Route path="/" element={<Home />} />
                {/* Public routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <EditPost />
                    </ProtectedRoute>
                  } 
                />
                {/* 404 Page - catches all unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer appears on all pages */}
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Simple 404 component
const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
};

const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const mainStyle = {
  flex: 1,
};

export default App;
