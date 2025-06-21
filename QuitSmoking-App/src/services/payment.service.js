import { BaseService } from "../config/base.service";
import { ENDPOINTS } from "../config/config";

/**
 * PaymentService handles all payment-related operations
 * by using the BaseService for API requests.
 * This structure mirrors the web application's service layer.
 */
export const PaymentService = {
  /**
   * Creates a PayPal order for a specific package.
   * @param {{ package_id: string }} payload - The package ID.
   * @returns {Promise<any>}
   */
  createPaypalOrder: (payload) => {
    return BaseService.post({
      url: ENDPOINTS.PAYMENT.CREATE_ORDER_PAYPAL,
      payload,
      isAuth: true, // Requires authentication
    });
  },

  /**
   * Captures a PayPal payment after user approval.
   * This corresponds to 'acceptPaypalOrder' in the web application.
   * @param {{ orderId: string }} payload - The order ID from PayPal.
   * @returns {Promise<any>}
   */
  capturePaypalOrder: ({ orderId }) => {
    return BaseService.post({
      url: ENDPOINTS.PAYMENT.ACCEPT_PAYPAL,
      payload: { orderId },
      isAuth: true, // Requires authentication
    });
  },

  /**
   * Gets the transaction history for the currently logged-in user.
   * @returns {Promise<any>}
   */
  getUserTransactions: () => {
    // Hardcoding the endpoint to ensure the correct one is called.
    // The backend's auth middleware will handle getting the user by their token.
    return BaseService.get({
      url: '/transactions/me',
      isAuth: true, // Requires authentication
    });
  },

  /**
   * (Admin) Gets all transactions in the system.
   * Note: This is likely an admin-only endpoint.
   * @returns {Promise<any>}
   */
  getAllTransactions: () => {
    return BaseService.get({
      url: ENDPOINTS.PAYMENT.GET_ALL_TRANSACTION,
      isAuth: true, // Requires authentication
    });
  },
}; 