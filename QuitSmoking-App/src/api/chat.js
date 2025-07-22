import { API_BASE_URL } from '../config/config';

export const getOrCreateSession = async (token) => {
    const response = await fetch(`${API_BASE_URL}/chat/session`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

export const getSessionByCoach = async (token) => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

export const getMessages = async (token, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${sessionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

export const closeSession = async (token, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${sessionId}/close`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("👌👌👌")
    return response.json();
};
