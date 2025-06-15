import { API_URL, ENDPOINTS } from '../config/config';

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.message === 'Network request failed') {
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
  }
  throw error;
};

// Ghi nhận tiến độ mới
export const recordProgress = async (planId, stageId, data, token) => {
  try {
    const endpoint = ENDPOINTS.PROGRESS.BY_STAGE
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể ghi nhận tiến độ');
    }

    return await response.json();
  } catch (error) {
    console.error('Error recording progress:', error);
    handleApiError(error);
  }
};

// Lấy tiến độ theo stage
export const getProgressByStage = async (planId, stageId, token) => {
  try {
    const endpoint = ENDPOINTS.PROGRESS.BY_STAGE
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy dữ liệu tiến độ');
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
    const endpoint = ENDPOINTS.PROGRESS.TOTAL
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(
      `${API_URL}${endpoint}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy tổng số điếu thuốc');
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
    const endpoint = ENDPOINTS.PROGRESS.MONEY
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(
      `${API_URL}${endpoint}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy tổng số tiền đã tiêu');
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
    const endpoint = ENDPOINTS.PROGRESS.DAILY_STATS
      .replace(':planId', planId)
      .replace(':stageId', stageId);

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy thống kê tiến độ');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching daily progress stats:', error);
    handleApiError(error);
  }
}; 