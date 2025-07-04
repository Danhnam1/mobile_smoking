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

// Ghi nhận tiến độ mới
export const recordProgress = async (planId, stageId, progressData, token) => {
  try {
    const endpoint = ENDPOINTS.QUITPLANPROGRESS.RECORD_PROGRESS
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(progressData)
    });

    if (!response.ok) {
      if (isJsonResponse(response)) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record progress');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Lấy tiến độ theo stage
export const getProgressByStage = async (planId, stageId, token) => {
  try {
    const endpoint = ENDPOINTS.QUITPLANPROGRESS.GET_ALL_PROGRESS
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (isJsonResponse(response)) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể lấy dữ liệu tiến độ');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching progress:', error);
    handleApiError(error);
  }
};

// Lấy tổng số điếu thuốc đã hút trong một khoảng thời gian
export const getTotalCigarettesInPeriod = async (planId, stageId, startDate, endDate, token) => {
  try {
    const endpoint = ENDPOINTS.QUITPLANPROGRESS.TOTAL_CIGARETTES
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(
      `${API_BASE_URL}${endpoint}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('getTotalCigarettesInPeriod API raw response:', response);

    if (!response.ok) {
      if (isJsonResponse(response)) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể lấy tổng số điếu thuốc');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching total cigarettes:', error);
    handleApiError(error);
  }
};

// Lấy tổng số tiền đã tiêu trong một khoảng thời gian
export const getTotalMoneySpentInPeriod = async (planId, stageId, startDate, endDate, token) => {
  try {
    const endpoint = ENDPOINTS.QUITPLANPROGRESS.TOTAL_MONEY_SAVED
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(
      `${API_BASE_URL}${endpoint}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('getTotalMoneySpentInPeriod API raw response:', response);

    if (!response.ok) {
      if (isJsonResponse(response)) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể lấy tổng số tiền đã tiêu');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching total money spent:', error);
    handleApiError(error);
  }
};

// Lấy thống kê tiến độ theo ngày
export const getDailyProgressStats = async (planId, stageId, token) => {
  try {
    const endpoint = ENDPOINTS.QUITPLANPROGRESS.DAILY_STATS
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      if (isJsonResponse(response)) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể lấy thống kê tiến độ');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching daily progress stats:', error);
    handleApiError(error);
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
    handleApiError(error);
  }
}; 