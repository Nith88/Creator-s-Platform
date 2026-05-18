
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    status: 'draft',
    image: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  /* ✏️ HANDLE INPUT CHANGES */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* 🖼️ HANDLE IMAGE UPLOAD */
  const handleUpload = async (uploadData) => {
    try {
      const imageUrl = uploadData.imageUrl;

      setFormData((prev) => ({
        ...prev,
        image: imageUrl
      }));

    } catch (err) {
      console.error('Upload handling failed:', err);
    }
  };

  /* 🚀 SUBMIT POST */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/posts', formData);

      if (response.data.success) {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create post'
      );

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1>Create New Post</h1>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>

          {/* TITLE */}
          <div style={fieldStyle}>
            <label>Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              required
              style={inputStyle}
            />
          </div>

          {/* CONTENT */}
          <div style={fieldStyle}>
            <label>Content</label>

            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content..."
              rows="10"
              required
              style={textareaStyle}
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div style={fieldStyle}>
            <label>Featured Image</label>

            <ImageUpload onUpload={handleUpload} />

            {formData.image && (
              <img
                src={formData.image}
                alt="Uploaded"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  marginTop: '1rem',
                  borderRadius: '8px'
                }}
              />
            )}
          </div>

          {/* CATEGORY */}
          <div style={fieldStyle}>
            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
            </select>
          </div>

          {/* STATUS */}
          <div style={fieldStyle}>
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* 🎨 STYLES */

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
};

const formContainerStyle = {
  width: '100%',
  maxWidth: '600px',
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const textareaStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  resize: 'vertical',
};

const buttonStyle = {
  padding: '0.75rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const errorStyle = {
  padding: '0.75rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb',
  borderRadius: '4px',
};

export default CreatePost;

