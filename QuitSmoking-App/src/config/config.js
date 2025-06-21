import { Platform } from 'react-native';

// Define the local IP address for development on physical devices.
// Replace this with your computer's local IP address.
const LOCAL_IP_ADDRESS = '192.168.100.7'; // EXAMPLE: '192.168.1.100'

// Define and export the base URL for the API.
// This handles the difference between Android Emulator and other environments.
export const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api' // Special address for Android Emulator
  : `http://${LOCAL_IP_ADDRESS}:3000/api`; // Local IP for iOS and physical devices

// API Configuration
// export const API_URL = 'http://10.0.2.2:3000/api'; // Development (for Android Emulator)
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
        RECORD_SMOKING: '/quit-plans/:planId/stages/:stageId/status',
        GET_ALL_SMOKING: '/quit-plans/:planId/stages/:stageId/status',
    },
    MEMBERSHIP: {
        
        ME: '/user-membership/me',
        CREATE_MEMBERSHIP:"/memberships",
        GET_ALL_MEMBERSHIP:"/memberships",
        GET_MEMBERSHIP_BY_ID:"/memberships/:id",
        UPDATE_MEMBERSHIP:"/memberships/:id",
        DELETE_MEMBERSHIP:"/memberships/:id"
    },
    PAYMENT: {
      CREATE_ORDER_PAYPAL: "/payments/paypal/create",
      ACCEPT_PAYPAL: "/payments/paypal/capture",
      GET_FOR_USER: "/transactions/me",
      GET_ALL_TRANSACTION: "/admin/transactions"
    }
};

// This structure mirrors the web application's API constants.
// Using API_BASE_URL from the new config setup
// import { API_BASE_URL } from '../api/config'; // This import is no longer needed.

// The API_PATHS constant below is now obsolete and has been replaced by ENDPOINTS.
// It is removed to avoid confusion. 