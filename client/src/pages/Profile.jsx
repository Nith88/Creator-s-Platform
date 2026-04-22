import api from '../services/api';

const handleUpdate = async () => {
  try {
    const response = await api.put('/api/profile', {
      name: newName,
      bio: newBio
    });
    
    console.log('Updated:', response.data);
  } catch (error) {
    console.error('Update failed:', error);
  }
};