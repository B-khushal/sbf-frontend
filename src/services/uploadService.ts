
import api from './api';

// Upload image
export const uploadImage = async (formData: FormData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  const response = await api.post('/uploads', formData, config);
  return response.data;
};
