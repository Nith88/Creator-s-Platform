import { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  /* ========================= */
  /* 🔌 SOCKET CONNECTION */
  /* ========================= */
  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    /* ✅ REAL-TIME EVENTS */

    // When a post is deleted (from any user)
    socket.on('post_deleted', (postId) => {
      setPosts((prev) => prev.filter((post) => post._id !== postId));

      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    });

    // When a new post is created
    socket.on('post_created', (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('post_deleted');
      socket.off('post_created');
      socket.disconnect();
    };
  }, [user]);

  /* ========================= */
  /* 📡 FETCH POSTS */
  /* ========================= */
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
    socket.disconnect(); // ✅ ensure socket closes on logout
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
        // Local update (instant UI)
        setPosts(posts.filter((post) => post._id !== postId));

        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        // Emit event to others
        socket.emit('delete_post', postId);

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

      {error && <div style={errorStyle}>{error}</div>}

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
/* ========================= */
/* 🌐 CONTAINER */
/* ========================= */
export const containerStyle = {
  minHeight: '100vh',
  padding: '2rem',
  maxWidth: '1100px',
  margin: '0 auto',
  background: 'linear-gradient(to right, #eef2f3, #ffffff)',
  fontFamily: 'Segoe UI, sans-serif',
};

/* ========================= */
/* 🔝 HEADER */
/* ========================= */
export const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1.2rem 1.5rem',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

/* ========================= */
/* 🔘 BUTTONS */
/* ========================= */
export const createButtonStyle = {
  padding: '0.5rem 1.2rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: '0.2s',
};

export const logoutButtonStyle = {
  padding: '0.5rem 1.2rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: '0.2s',
};

export const editButtonStyle = {
  padding: '0.4rem 1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

export const deleteButtonStyle = {
  padding: '0.4rem 1rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

/* ========================= */
/* 📦 POSTS */
/* ========================= */
export const postsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export const postCardStyle = {
  padding: '1.5rem',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
  transition: 'all 0.25s ease',
  border: '1px solid #f1f1f1',
};

/* ========================= */
/* 📝 TEXT */
/* ========================= */
export const contentPreviewStyle = {
  color: '#555',
  margin: '1rem 0',
  lineHeight: '1.5',
};

export const metaStyle = {
  display: 'flex',
  gap: '1rem',
  fontSize: '0.8rem',
  color: '#888',
  flexWrap: 'wrap',
};

/* ========================= */
/* ⚙️ ACTIONS */
/* ========================= */
export const actionsStyle = {
  marginTop: '1rem',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
};

/* ========================= */
/* 📄 PAGINATION */
/* ========================= */
export const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '2rem',
  padding: '1rem',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
};

export const paginationButtonStyle = {
  padding: '0.5rem 1.2rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export const pageInfoStyle = {
  fontSize: '0.9rem',
  color: '#555',
};

/* ========================= */
/* ⚠️ STATES */
/* ========================= */
export const errorStyle = {
  padding: '1rem',
  backgroundColor: '#fdecea',
  color: '#b71c1c',
  borderRadius: '6px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb',
};

export const emptyStateStyle = {
  textAlign: 'center',
  padding: '2rem',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
};

export const centerStyle = {
  textAlign: 'center',
  marginTop: '2rem',
  fontSize: '1rem',
  color: '#666',
};
export default Dashboard;