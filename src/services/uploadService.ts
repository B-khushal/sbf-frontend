import api from './api';

// Upload image
export const uploadImage = async (
  formData: FormData,
  type: 'product' | 'category' | 'logo' | 'header' | 'branding' | 'hero' = 'product'
) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      type: type
    },
    // Uploads can take longer due to network + Cloudinary processing/retries.
    timeout: 120000,
  };
  
  try {
    // `api` already uses a `/api` base URL, so route must be `/uploads` (not `/api/uploads`).
    const response = await api.post('/uploads', formData, config);
    
    if (!response.data || !response.data.imageUrl) {
      throw new Error('Invalid response from upload service');
    }
    
    return response.data;
  } catch (error) {
    console.error('Upload service error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      data: error?.response?.data,
    });
    throw error;
  }
};
