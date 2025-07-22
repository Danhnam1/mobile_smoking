import { API_BASE_URL } from '../config/config';

export const CoachUserService = {
    getRelations: async(token, coach_id) => {
        const response = await fetch(`${API_BASE_URL}/coach-users?coach_id=${coach_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },
    getById : async(token, id) => {
        const response = await fetch(`${API_BASE_URL}/coach-users/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },
}