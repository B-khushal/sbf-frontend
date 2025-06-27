import api from './api';

// Upload image
export const uploadImage = async (formData: FormData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  try {
    const response = await api.post('/uploads', formData, config);
    
    if (!response.data || !response.data.imageUrl) {
      throw new Error('Invalid response from upload service');
    }
    
    return response.data;
  } catch (error) {
    console.error('Upload service error:', error);
    throw error;
  }
};
