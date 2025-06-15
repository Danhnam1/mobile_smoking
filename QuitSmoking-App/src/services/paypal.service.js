const axios = require("axios");

const PAYPAL_API = process.env.PAYPAL_API;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Lấy access token từ PayPal
exports.getAccessToken = async () => {
  try {
    const base64 = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const res = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${base64}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.data.access_token;
  } catch (error) {
    console.error("PayPal getAccessToken error:", error.response?.data || error.message);
    throw new Error("Không thể xác thực với PayPal");
  }
};

// Tạo order trên PayPal
exports.createOrder = async (amount, currency = "VND") => {
  try {
    const accessToken = await this.getAccessToken();

    // Chuyển đổi VND sang USD nếu cần
    let finalAmount = amount;
    let finalCurrency = currency;
    
    if (currency === "VND") {
      // Giả sử tỷ giá 1 USD = 24,500 VND
      finalAmount = (amount / 24500).toFixed(2);
      finalCurrency = "USD";
    }

    const res = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: finalCurrency,
              value: finalAmount.toString(),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.APP_URL}/paypal-success`,
          cancel_url: `${process.env.APP_URL}/paypal-cancel`,
          brand_name: "Quit Smoking App",
          locale: "vi-VN",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("PayPal createOrder error:", error.response?.data || error.message);
    throw new Error("Không thể tạo đơn hàng PayPal");
  }
};

// Capture order sau khi user approve
exports.captureOrder = async (orderId) => {
  try {
    const accessToken = await this.getAccessToken();
    const res = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("PayPal captureOrder error:", error.response?.data || error.message);
    throw new Error("Không thể xác nhận thanh toán PayPal");
  }
}; 