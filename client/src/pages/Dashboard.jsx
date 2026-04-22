import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Fetch posts when component mounts or page changes
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/posts?page=${page}&limit=10`);
      
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
const handleLogout = () => {
  logout();           // clears auth (from context)
  navigate('/login'); // redirect after logout
};
return (
    <div style={containerStyle}>
      {/* Header with Create Button */}
      <div style={headerStyle}>
        <h1>Welcome, {user.name}!</h1>
        <Link to="/create">
          <button style={createButtonStyle}>
            + Create New Post
          </button>
        </Link>
      </div>

      {/* Error Message */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Posts List */}
      <div style={postsContainerStyle}>
        {posts.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>You haven't created any posts yet.</p>
            <Link to="/create">Create your first post</Link>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post._id} style={postCardStyle}>
                <h3>{post.title}</h3>
                <p style={contentPreviewStyle}>
                  {post.content.substring(0, 150)}...
                </p>
                <div style={metaStyle}>
                  <span>{post.category}</span>
                  <span>{post.status}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <div style={paginationStyle}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                style={paginationButtonStyle}
              >
                Previous
              </button>

              <span style={pageInfoStyle}>
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} total posts)
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                style={paginationButtonStyle}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '2rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '8px',
};

const paginationButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const pageInfoStyle = {
  color: '#666',
  fontSize: '0.9rem',
};

const postCardStyle = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  marginBottom: '1rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const contentPreviewStyle = {
  color: '#666',
  margin: '1rem 0',
};

const metaStyle = {
  display: 'flex',
  gap: '1rem',
  fontSize: '0.85rem',
  color: '#999',
};

const containerStyle = {
  minHeight: '80vh',
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const logoutButtonStyle = {
  padding: '0.5rem 1.5rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500',
};

const contentStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
};

const cardStyle = {
  padding: '2rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const infoStyle = {
  marginTop: '1rem',
  lineHeight: '2',
};
const createButtonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500',
};

const postsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
};
const errorStyle = {
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '5px',
  marginBottom: '1rem',
};
const emptyStateStyle = {
  textAlign: 'center',
  padding: '2rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

export default Dashboard;