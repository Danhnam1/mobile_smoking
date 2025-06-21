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

// Fetches all available badge definitions
export const fetchAllBadges = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/badges`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching all badges:`, error);
    handleApiError(error);
  }
};

export const getAllBadges = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/badges`, {
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching badges:', error);
    handleApiError(error);
  }
}; 