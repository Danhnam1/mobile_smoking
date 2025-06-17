import { API_URL, ENDPOINTS } from '../config/config';

export const createQuitPlan = async (planData, token) => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLAN.CREATE_QUIT_PLAN}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLAN.STAGE_SUGGESTION}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLAN.GET_QUIT_PLAN_OF_USER.replace(':id', userId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLAN.GET_DETAIL_QUITPLAN_OF_USER.replace(':planId', planId)}`, {
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
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITSTAGE.GET_ALL_STAGE_OF_QUITPLAN.replace(':planId', planId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get quit plan stages');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateQuitPlanStatus = async (planId, status, token) => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLAN.UPDATE_QUITPLAN.replace(':planId', planId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLAN.SUMMARY.replace(':planId', planId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITSTAGE.CREATE_STAGE.replace(':planId', planId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITSTAGE.UPDATE_STAGE.replace(':planId', planId).replace(':stageId', stageId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITSTAGE.DELETE_STAGE.replace(':planId', planId).replace(':stageId', stageId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLANPROGRESS.RECORD_PROGRESS.replace(':id', planId).replace(':id', stageId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.QUITPLANPROGRESS.GET_ALL_PROGRESS.replace(':id', planId).replace(':id', stageId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.SMOKINGSTATUS.RECORD_SMOKING.replace(':id', planId).replace(':id', stageId)}`, {
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
    const response = await fetch(`${API_URL}${ENDPOINTS.SMOKINGSTATUS.GET_ALL_SMOKING.replace(':id', planId).replace(':id', stageId)}`, {
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
  const response = await fetch(`${API_URL}/quit-plans/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
  const plans = await response.json();
  // Trả về plan đầu tiên có status 'ongoing'
  return plans.find(plan => plan.status === 'ongoing');
}; 