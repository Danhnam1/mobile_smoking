import { API_BASE_URL } from '../config/config';

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.message === 'Network request failed') {
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
  }
  throw error;
};

// Helper function to check if response is JSON
const isJsonResponse = (response) => {
  const contentType = response.headers.get('content-type');
  return contentType && contentType.includes('application/json');
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Sai tài khoản hoặc mật khẩu!');
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

export const register = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Đăng ký thất bại!');
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

export const loginWithGoogle = async (idToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) {
      throw new Error('Đăng nhập Google thất bại!');
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
}; 