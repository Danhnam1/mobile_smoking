import { API_BASE_URL } from './index';

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
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/progress/${stageId}`, {
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
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/smoking-status/${stageId}`, {
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
    const response = await fetch(`${API_BASE_URL}/quit-plans/${planId}/smoking-status/${stageId}`, {
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

export const fetchQuitPlan = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/quit-plans/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    throw await safeParseJSON(response);
  }
  const plans = await safeParseJSON(response);
  // Trả về plan đầu tiên có status 'ongoing'
  return plans.find(plan => plan.status === 'ongoing');
}; 