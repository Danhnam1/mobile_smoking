// API Configuration
export const API_URL = 'http://10.0.2.2:3000/api'; // Development (for Android Emulator)
// export const API_URL = 'http://YOUR_LOCAL_IP:3000/api'; // Development (for physical device or other emulators)
// export const API_URL = 'https://your-production-api.com/api'; // Production

// Other configurations
export const APP_CONFIG = {
    VERSION: '1.0.0',
    ENV: 'development',
    DEFAULT_LANGUAGE: 'vi',
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm',
    CURRENCY: 'VND',
    CURRENCY_SYMBOL: '₫',
    DEFAULT_CIGARETTE_PRICE: 25000, // Default price per pack
    CIGARETTES_PER_PACK: 20, // Default number of cigarettes per pack
};

// API Endpoints
export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
    },
    USER: {
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
    },
    PROGRESS: {
        TRACKING: '/progress-tracking',
        BY_STAGE: '/progress-tracking/:planId/:stageId',
        TOTAL: '/progress-tracking/:planId/:stageId/total',
        MONEY: '/progress-tracking/:planId/:stageId/money',
        DAILY_STATS: '/progress-tracking/:planId/:stageId/daily-stats',
    },
    PLANS: {
        LIST: '/quit-plans',
        DETAIL: '/quit-plans/:id',
        STAGES: '/quit-plans/:id/stages',
    },
    MEMBERSHIP: {
        PACKAGES: '/membership/packages',
        SUBSCRIBE: '/membership/subscribe',
        STATUS: '/membership/status',
    },
}; 