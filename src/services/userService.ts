
import api from './api';

// Admin: Get all users
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Admin: Get user by ID
export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Admin: Update user
export const updateUser = async (id: string, userData: any) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Admin: Delete user
export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
