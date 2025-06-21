import { API_BASE_URL, ENDPOINTS } from '../config/config';

// Helper to safely parse JSON only if content-type is application/json
const safeParseJSON = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    const text = await response.text();
    throw new Error('Server returned non-JSON response: ' + text);
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.message === 'Network request failed') {
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
  }
  throw error;
};

export const createQuitPlan = async (planData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getSuggestedStages = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/stage-suggestion`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getUserQuitPlans = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getQuitPlanById = async (planId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getQuitPlanStages = async (planId, token) => {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages`, { headers });

  if (!res.ok) {
    throw await safeParseJSON(res);
  }
  return await safeParseJSON(res);
};

export const updateQuitPlanStatus = async (planId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getQuitPlanSummary = async (planId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // console.log('getQuitPlanSummary API raw response:', response);

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const createQuitPlanStage = async (planId, stageData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(stageData)
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const updateQuitPlanStage = async (planId, stageId, stageData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages/${stageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(stageData)
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const deleteQuitPlanStage = async (planId, stageId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages/${stageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const recordProgress = async (planId, stageId, progressData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(progressData)
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getProgressByStage = async (planId, stageId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages/${stageId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const recordSmokingStatus = async (planId, stageId, statusData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages/${stageId}/smoking-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

export const getSmokingStatus = async (planId, stageId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages/${stageId}/smoking-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw await safeParseJSON(response);
    }
    return await safeParseJSON(response);
  } catch (error) {
    throw error;
  }
};

// Fetches the active quit plan for a user
export const fetchQuitPlan = async (userId, token) => {
  try {
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
    handleApiError(error);
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
    handleApiError(error);
  }
}; 