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
    QUITPLAN: {
        CREATE_QUIT_PLAN: '/quit-plans',
        GET_QUIT_PLAN_OF_USER: '/quit-plans/user/:id',
        GET_DETAIL_QUITPLAN_OF_USER: '/quit-plans/:planId',
        UPDATE_QUITPLAN: '/quit-plans/:planId/status',
        STAGE_SUGGESTION: '/quit-plans/stage-suggestion',
        SUMMARY: '/quit-plans/:planId/summary',
    },
    QUITPLANPROGRESS: {
        RECORD_PROGRESS: '/quit-plans/:planId/stages/:stageId/progress',
        GET_ALL_PROGRESS: '/quit-plans/:planId/stages/:stageId/progress',
        TOTAL_CIGARETTES: '/progress-tracking/:planId/:stageId/total',
        TOTAL_MONEY_SAVED: '/progress-tracking/:planId/:stageId/money',
        DAILY_STATS: '/progress-tracking/:planId/:stageId/daily-stats',
    },
    QUITSTAGE: {
        GET_ALL_STAGE_OF_QUITPLAN: '/quit-plans/:planId/stages',
        CREATE_STAGE: '/quit-plans/:planId/stages',
        UPDATE_STAGE: '/quit-plans/:planId/stages/:stageId',
        DELETE_STAGE: '/quit-plans/:planId/stages/:stageId',
    },
    SMOKINGSTATUS: {
        RECORD_SMOKING: '/quit-plan/:planId/stages/:stageId/status',
        GET_ALL_SMOKING: '/quit-plan/:planId/stages/:stageId/status',
    },
    MEMBERSHIP: {
        PACKAGES: '/membership/packages',
        SUBSCRIBE: '/membership/subscribe',
        STATUS: '/membership/status',
    },
}; 