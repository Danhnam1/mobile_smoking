import { API_BASE_URL } from '../config/config';

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

export const getDashboard = async (token) => {
    
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }

  });
  return response.json();
};