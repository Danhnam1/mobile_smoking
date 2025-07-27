import { API_BASE_URL } from '../config/config';

export const FeedBackService = {
    createFeedbackCoach: async (token, coach_user_id, rating, comment) => {
        const response = await fetch(`${API_BASE_URL}/feedback/coach`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                coach_user_id,
                rating,
                comment
            })
        });
    
        if (!response.ok) {
            // Có thể thêm check lỗi ở đây
            const error = await response.text();
            throw new Error(`Failed to create feedback: ${error}`);
        }
    
        return response.json();
    },

    getFeedbacksByCoach: async ( token ,coach_user_id) => {
        const response = await fetch(`${API_BASE_URL}/feedback/coach/${coach_user_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },
}