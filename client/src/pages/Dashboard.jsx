import { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/api/posts/${postId}`);

      if (response.data.success) {
        setPosts(posts.filter((post) => post._id !== postId));

        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        alert('Post deleted successfully');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div style={centerStyle}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2>Welcome, {user.name} 👋</h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/create">
            <button style={createButtonStyle}>+ Create</button>
          </Link>

          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Loading */}
      {isLoading ? (
        <div style={centerStyle}>Loading posts...</div>
      ) : (
        <div style={postsContainerStyle}>
          {posts.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No posts yet</p>
              <Link to="/create">Create your first post</Link>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    ...postCardStyle,
                    transform:
                      hoveredId === post._id ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setHoveredId(post._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <h3>{post.title}</h3>

                  <p style={contentPreviewStyle}>
                    {post.content.substring(0, 150)}...
                  </p>

                  <div style={metaStyle}>
                    <span>{post.category}</span>
                    <span>{post.status}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* ✅ Actions (Edit + Delete) */}
                  <div style={actionsStyle}>
                    <Link to={`/edit/${post._id}`}>
                      <button style={editButtonStyle}>Edit</button>
                    </Link>

                    <button
                      onClick={() => handleDelete(post._id)}
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div style={paginationStyle}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  style={{
                    ...paginationButtonStyle,
                    opacity: !pagination.hasPrevPage ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>

                <span style={pageInfoStyle}>
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} posts)
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{
                    ...paginationButtonStyle,
                    opacity: !pagination.hasNextPage ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/* ========================= */
/* 🎨 CSS-IN-JS STYLES */
/* ========================= */

const containerStyle = {
  minHeight: '100vh',
  padding: '2rem',
  maxWidth: '1100px',
  margin: '0 auto',
  backgroundColor: '#f4f6f8',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1rem 1.5rem',
  backgroundColor: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
};

const createButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const postsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const postCardStyle = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '10px',
  marginBottom: '1rem',
  boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease',
};

const contentPreviewStyle = {
  color: '#555',
  margin: '1rem 0',
};

const metaStyle = {
  display: 'flex',
  gap: '1rem',
  fontSize: '0.8rem',
  color: '#888',
};

const actionsStyle = {
  marginTop: '1rem',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
};

const editButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
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
  fontSize: '0.9rem',
  color: '#555',
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
  backgroundColor: '#fff',
  borderRadius: '10px',
};

const centerStyle = {
  textAlign: 'center',
  marginTop: '2rem',
};