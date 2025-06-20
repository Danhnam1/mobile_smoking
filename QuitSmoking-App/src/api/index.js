import { Platform } from 'react-native';
import { ENDPOINTS } from '../config/config';

// Thay đổi địa chỉ IP này thành địa chỉ IP cục bộ của máy tính bạn khi test trên thiết bị thật/iOS Simulator
const LOCAL_IP_ADDRESS = '192.168.100.7'; // VÍ DỤ: '192.168.1.100'

export const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api' // Địa chỉ đặc biệt cho Android Emulator
  : `http://${LOCAL_IP_ADDRESS}:3000/api`; // Sử dụng IP cục bộ cho iOS và thiết bị thật

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
    throw error;
  }
};

// Fetches smoking status/progress data for a user
// This endpoint needs to be clarified as it's not explicitly in the provided docs.
// It's assumed to provide overall progress like cigarette_count, money_spent, health_note.
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
      throw new Error('Failed to fetch smoking status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching smoking status:', error);
    throw error;
  }
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
    throw error;
  }
};

// Fetches the active quit plan for a user
// This endpoint needs to be clarified as it's not explicitly in the provided docs.
// It's assumed to provide the overall quit plan for the user, including start_date.
export const fetchQuitPlan = async (userId, token) => {
  try {
    // Placeholder: You will need to replace this with your actual endpoint
    // For example, if it's a summary of quit plans:
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/quit-plans/user/${userId}`, {
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Assuming the API returns an array of plans, and we want the active one or the first one
    const plans = await response.json();

    // Find the active (ongoing) plan
    const activePlan = plans.find(plan => plan.status === 'ongoing');
    return activePlan || null; // Return the active plan or null
  } catch (error) {
    console.error(`Error fetching quit plan for user ${userId}:`, error);
    throw error;
  }
};

// Fetch progress tracking data for a user
export const fetchUserProgress = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/progress-tracking/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch progress data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching progress data:', error);
    throw error;
  }
};

export const createSmokingStatus = async (planId, stageId, data) => {
  try {
    const endpoint = ENDPOINTS.SMOKINGSTATUS.RECORD_SMOKING
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create smoking status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating smoking status:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error('Sai tài khoản hoặc mật khẩu!');
  }
  return await response.json();
};

export const register = async (data) => {
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
    throw error;
  }
};

export const getMembershipPackages = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/memberships`, {
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching membership packages:', error);
    throw error;
  }
};

export const createPayment = async (paymentData, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Thanh toán thất bại!');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const createPayPalOrder = async (data, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Creating PayPal order with data:', data);
    console.log('Using token:', token ? 'present' : 'missing');
    console.log('API URL:', `${API_BASE_URL}/payments/paypal/create`);

    const response = await fetch(`${API_BASE_URL}/payments/paypal/create`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log('PayPal order response status:', response.status);
    console.log('PayPal order response headers:', response.headers);
    console.log('PayPal order response data:', responseData);

    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || 'Failed to create PayPal order!';
      console.error('PayPal order error details:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('Error creating PayPal order:', {
      message: error.message,
      stack: error.stack,
      data: error.response?.data
    });
    throw error;
  }
};

export const capturePayPalOrder = async (orderId, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/payments/paypal/capture`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to capture PayPal order!');
    }
    return await response.json();
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};

export const getPayPalPaymentStatus = async (orderId, token) => {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/payments/paypal/status/${orderId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get PayPal payment status!');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting PayPal payment status:', error);
    throw error;
  }
};

export const updateUser = async (userData, token) => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT', // Changed to PUT
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Cập nhật người dùng thất bại!');
  }
  return await response.json();
};

export const getAllBadges = async (token) => {
  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/badges`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all badges:', error);
    throw error;
  }
};

export const createQuitPlan = async (planData, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/quit-plans`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(planData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Tạo kế hoạch bỏ thuốc thất bại!');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating quit plan:', error);
    throw error;
  }
};

export const loginWithGoogle = async (idToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Google login failed');
  }
  return await response.json();
};