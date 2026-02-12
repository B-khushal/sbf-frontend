import api from './api';

// Upload image
export const uploadImage = async (formData: FormData, type: 'product' | 'category' = 'product') => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      type: type
    }
  };
  
  try {
    const response = await api.post('/api/uploads', formData, config);
    
    if (!response.data || !response.data.imageUrl) {
      throw new Error('Invalid response from upload service');
    }
    
    return response.data;
  } catch (error) {
    console.error('Upload service error:', error);
    throw error;
  }
};
