import { API_BASE_URL, ENDPOINTS } from "../config/config";

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.message === "Network request failed") {
    throw new Error(
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
    );
  }
  throw error;
};

// Helper function to check if response is JSON
const isJsonResponse = (response) => {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json");
};

// Fetches user details
export const fetchUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    handleApiError(error);
  }
};

export const updateUser = async (userData, token) => {
  try {
    console.log("Updating user with data:", userData);
    console.log("Using token:", token ? "present" : "missing");

    // Try the new endpoint first
    let response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    // If the new endpoint fails, try the original endpoint
    if (!response.ok && response.status === 404) {
      console.log("New endpoint failed, trying original endpoint...");
      response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
    }

    console.log("Update user response status:", response.status);
    console.log("Update user response headers:", response.headers);

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = "Failed to update user";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("Update user error details:", errorData);
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Update user success:", result);
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; // Re-throw the error instead of calling handleApiError
  }
};

// Fetches smoking status/progress data for a user
export const fetchSmokingStatus = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/smoking-status/pre-plan/latest`,
      {
        headers: headers,
      }
    );
    if (!response.ok) {
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

export const createSmokingStatusInitial = async (data, token) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/smoking-status/pre-plan`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        err.message || "Tạo trạng thái hút thuốc ban đầu thất bại!"
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi tạo trạng thái hút thuốc ban đầu:", error);
    handleApiError(error);
  }
};

// Fetches all available membership packages
export const getMembershipPackages = async (token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.MEMBERSHIP.GET_ALL_MEMBERSHIP}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Attempt to parse the error response from the server for more details.
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If the error response is not JSON, throw a generic HTTP error.
        throw new Error(
          `Không thể tải các gói thành viên. Lỗi HTTP: ${response.status}`
        );
      }
      // If the error is JSON, use the message from the server.
      throw new Error(
        errorData.message || `Lỗi không xác định từ server: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    // Log the detailed error for debugging and re-throw it to be handled by the UI.
    console.error("Lỗi chi tiết khi tải gói thành viên:", error);
    throw error;
  }
};

/**
 * Fetches the current membership status for the logged-in user.
 * @param {string} token - The authentication token for the user.
 * @returns {Promise<any>} The user's current membership data.
 */
export const getCurrentUserMembership = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEMBERSHIP.ME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If response is 404, it means no active membership, which is a valid case.
    if (response.status === 404) {
      return null; // Return null to indicate no membership
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(
          `Không thể lấy trạng thái thành viên. Lỗi HTTP: ${response.status}`
        );
      }
      throw new Error(
        errorData.message || `Lỗi không xác định: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái thành viên:", error);
    throw error;
  }
};

// Lấy coachId theo userId (dùng cho video call)
export const getCoachByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/video/coach/${userId}`);
    if (!response.ok) {
      throw new Error("Không tìm thấy coach cho user này");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching coach by userId:", error);
    throw error;
  }
};

// Lấy thông tin coach theo coach ID
export const getCoachById = async (coachId, token) => {
  try {
    // Thử endpoint /coaches/:id trước
    const response = await fetch(`${API_BASE_URL}/coaches/${coachId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    // Nếu không có, thử /users/:id
    const response2 = await fetch(`${API_BASE_URL}/users/${coachId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response2.ok) {
      const userData = await response2.json();
      // Kiểm tra xem user có phải là coach không
      if (userData.role === "coach") {
        return userData;
      }
    }

    throw new Error("Không tìm thấy coach");
  } catch (error) {
    console.error("Error fetching coach by ID:", error);
    throw error;
  }
};

// Lấy danh sách tất cả coaches
export const getAllCoaches = async (token) => {
  try {
    // Thử endpoint /coaches trước
    console.log("Fetching coaches from:", `${API_BASE_URL}/coaches`);

    const response = await fetch(`${API_BASE_URL}/coaches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Coaches API response status:", response.status);

    if (response.ok) {
      const coachesData = await response.json();
      console.log("Coaches data received:", coachesData);
      return coachesData;
    }

    // Nếu /coaches không tồn tại, thử /users/coaches
    console.log(
      "Trying alternative endpoint:",
      `${API_BASE_URL}/users/coaches`
    );

    const response2 = await fetch(`${API_BASE_URL}/users/coaches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Users/coaches API response status:", response2.status);

    if (response2.ok) {
      const coachesData2 = await response2.json();
      console.log("Coaches data from users/coaches:", coachesData2);
      return coachesData2;
    }

    // Nếu cả hai đều không hoạt động, thử /users và filter
    console.log("Trying users endpoint with filter:", `${API_BASE_URL}/users`);

    const response3 = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Users API response status:", response3.status);

    if (response3.ok) {
      const allUsers = await response3.json();
      console.log("All users data received:", allUsers);

      // Filter users with role = "coach"
      const coaches = allUsers.filter((user) => user.role === "coach");
      console.log("Coaches filtered:", coaches);

      return coaches;
    }

    // Nếu tất cả đều thất bại
    console.log("All endpoints failed, returning empty array");
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách coaches:", error);
    console.log("Returning empty coaches array due to error");
    return [];
  }
};
