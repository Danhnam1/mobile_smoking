import { API_BASE_URL } from "../api/config";

// This structure mirrors the web application's API constants.
export const API_PATHS = {
    PAYMENT:{
      CREATE_ORDER_PAYPAL: `${API_BASE_URL}/payments/paypal/create`,
      ACCEPT_PAYPAL: `${API_BASE_URL}/payments/paypal/capture`,
      GET_FOR_USER: `${API_BASE_URL}/transactions/me`,
      GET_ALL_TRANSACTION: `${API_BASE_URL}/admin/transactions`
    }
    // Other API groups can be added here in the future
}; 