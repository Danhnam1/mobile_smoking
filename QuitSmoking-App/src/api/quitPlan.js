import { API_BASE_URL } from './index';

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
      const error = await response.json();
      throw new Error(error.message || 'Failed to create quit plan');
    }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    throw error;
  }
};

export const getSuggestedStages = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quit-plans/stages/suggestion`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get suggested stages');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user quit plans');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to get quit plan');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getQuitPlanStages = async (planId, token) => {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await fetch(`${API_BASE_URL}/quit-plans/${planId}/stages`, { headers });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get quit plan stages');
  }

  return await res.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to update quit plan status');
    }

    return await response.json();
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
    console.log('getQuitPlanSummary API raw response:', response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get quit plan summary');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to create quit plan stage');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to update quit plan stage');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete quit plan stage');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to record progress');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to get progress');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to record smoking status');
    }

    return await response.json();
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to get smoking status');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchQuitPlan = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/quit-plans/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
  const plans = await response.json();
  // Trả về plan đầu tiên có status 'ongoing'
  return plans.find(plan => plan.status === 'ongoing');
}; 