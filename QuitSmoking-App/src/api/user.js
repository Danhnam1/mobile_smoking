import { API_BASE_URL, ENDPOINTS } from '../config/config';

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

// Fetches user details
export const fetchUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    handleApiError(error);
  }
};

export const updateUser = async (userData, token) => {
  try {
    console.log('Updating user with data:', userData);
    console.log('Using token:', token ? 'present' : 'missing');
    
    // Try the new endpoint first
    let response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    // If the new endpoint fails, try the original endpoint
    if (!response.ok && response.status === 404) {
      console.log('New endpoint failed, trying original endpoint...');
      response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
    }
    
    console.log('Update user response status:', response.status);
    console.log('Update user response headers:', response.headers);
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = 'Failed to update user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Update user error details:', errorData);
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Update user success:', result);
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error; // Re-throw the error instead of calling handleApiError
  }
};

// Fetches smoking status/progress data for a user
export const fetchSmokingStatus = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/smoking-status/pre-plan/latest`, {
      headers: headers,
    });
    if (!response.ok) {
      
    }
    return await response.json();
  } catch (error) {
    
    handleApiError(error);
  }
};

export const createSmokingStatusInitial = async (data, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/smoking-status/pre-plan`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Tạo trạng thái hút thuốc ban đầu thất bại!');
    }
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo trạng thái hút thuốc ban đầu:', error);
    handleApiError(error);
  }
};

// Fetches all available membership packages
export const getMembershipPackages = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEMBERSHIP.GET_ALL_MEMBERSHIP}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      // Attempt to parse the error response from the server for more details.
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If the error response is not JSON, throw a generic HTTP error.
        throw new Error(`Không thể tải các gói thành viên. Lỗi HTTP: ${response.status}`);
      }
      // If the error is JSON, use the message from the server.
      throw new Error(errorData.message || `Lỗi không xác định từ server: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Log the detailed error for debugging and re-throw it to be handled by the UI.
    console.error('Lỗi chi tiết khi tải gói thành viên:', error);
    throw error;
  }
};

/**
 * Fetches the current membership status for the logged-in user.
 * @param {string} token - The authentication token for the user.
 * @returns {Promise<any>} The user's current membership data.
 */
export const getCurrentUserMembership = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEMBERSHIP.ME}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    // If response is 404, it means no active membership, which is a valid case.
    if (response.status === 404) {
      return null; // Return null to indicate no membership
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Không thể lấy trạng thái thành viên. Lỗi HTTP: ${response.status}`);
      }
      throw new Error(errorData.message || `Lỗi không xác định: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy trạng thái thành viên:', error);
    throw error;
  }
};

// Lấy coachId theo userId (dùng cho video call)
export const getCoachByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/video/coach/${userId}`);
    if (!response.ok) {
      throw new Error('Không tìm thấy coach cho user này');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching coach by userId:', error);
    throw error;
  }
};