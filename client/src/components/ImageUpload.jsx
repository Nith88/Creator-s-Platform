
import { useEffect, useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  /* 📦 STATE */
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  /* ✅ VALIDATE FILE */
  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file';
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and WEBP images are allowed';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  /* 📁 HANDLE FILE CHANGE */
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setError('');
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  /* 🚀 HANDLE SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) return;

    try {
      const formData = new FormData();

      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Upload Success:', response.data);

      alert('Image uploaded successfully!');
    } catch (err) {
      console.error('❌ Upload Error:', err);

      setError(
        err.response?.data?.message || 'Image upload failed'
      );
    }
  };

  /* 🧹 CLEANUP OBJECT URL */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* 🎨 JSX */
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          style={{
            width: '200px',
            marginTop: '10px',
            borderRadius: '10px'
          }}
        />
      )}

      <button
        type="submit"
        disabled={!selectedFile || !!error}
        style={{
          display: 'block',
          marginTop: '10px'
        }}
      >
        Upload
      </button>
    </form>
  );
};

export default ImageUpload;
