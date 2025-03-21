import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "https://api.lacehub.cz",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Dispatch an event to notify the application about the unauthorized access
      const event = new CustomEvent("auth:unauthorized", {
        detail: { message: "Your session has expired. Please sign in again." },
      });
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

// Helper function to get the auth token
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function to create authenticated fetch options
const createAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Export the original API functions
export const fetchTotalUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/total-users",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Parse the JSON data and return it
    const data = await response.json();
    console.log("Total users data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching total users:", error);
    return { count: 0 };
  }
};

export const fetchActiveUserCount = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/active-user-count",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Active users data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching active users:", error);
    return { count: 0 };
  }
};

export const fetchDailyMatches = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/matches/admin/daily-matches",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Daily matches data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching daily matches:", error);
    return { labels: [], counts: [], totalMatches: 0 };
  }
};

export const fetchMonthlyRegistrations = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `https://api.lacehub.cz/users/admin/monthly-register?startDate=${startDate}&endDate=${endDate}`,
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Monthly registrations data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching monthly registrations:", error);
    return { labels: [], counts: [], totalRegistered: 0 };
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const fetchActiveUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/active-users",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching active users:", error);
    return [];
  }
};

export const fetchInactiveUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/inactive-users",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching inactive users:", error);
    return [];
  }
};

export const fetchBannedUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/banned-users",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching banned users:", error);
    return [];
  }
};

export const banUser = async (userId) => {
  try {
    const response = await fetch(
      `https://api.lacehub.cz/users/admin/${userId}/ban`,
      {
        method: "PUT",
        ...createAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error banning user ${userId}:`, error);
    throw error;
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await fetch(
      `https://api.lacehub.cz/users/admin/${userId}/unban`,
      {
        method: "PUT",
        ...createAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error unbanning user ${userId}:`, error);
    throw error;
  }
};

const handleApiResponse = async (response) => {
  // Create a more detailed error message based on status code
  if (!response.ok) {
    let errorMessage = "";

    switch (response.status) {
      case 400:
        errorMessage =
          "Bad request: The request was malformed or contained invalid data.";
        break;
      case 401:
        errorMessage =
          "Unauthorized: You need to log in to perform this action.";
        break;
      case 403:
        errorMessage =
          "Forbidden: You don't have permission to perform this action.";
        break;
      case 404:
        errorMessage = "Not found: The requested resource was not found.";
        break;
      case 429:
        errorMessage = "Too many requests: Please wait before trying again.";
        break;
      case 500:
      case 502:
      case 503:
        errorMessage =
          "Server error: Something went wrong on our end. Please try again later.";
        break;
      default:
        errorMessage = `Error (${response.status}): ${response.statusText}`;
    }

    // Try to get more detailed error message from the response if available
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = `${errorMessage} - ${errorData.message}`;
      }
    } catch (e) {
      // If parsing json fails, just use the status error
    }

    throw new Error(errorMessage);
  }

  return await response.json();
};

// API functions for user dashboard
export const updateWtbItem = async (id, data) => {
  try {
    const response = await fetch(`https://api.lacehub.cz/wtb/${id}`, {
      method: "PATCH",
      ...createAuthHeaders(),
      body: JSON.stringify(data),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error updating WTB item:", error);
    throw error;
  }
};

export const deleteWtbItem = async (id) => {
  try {
    const response = await fetch(`https://api.lacehub.cz/wtb/${id}`, {
      method: "DELETE",
      ...createAuthHeaders(),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting WTB item:", error);
    throw error;
  }
};

export const updateWtsItem = async (id, data) => {
  try {
    const response = await fetch(`https://api.lacehub.cz/wts/${id}`, {
      method: "PATCH",
      ...createAuthHeaders(),
      body: JSON.stringify(data),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error updating WTS item:", error);
    throw error;
  }
};

export const deleteWtsItem = async (id) => {
  try {
    const response = await fetch(`https://api.lacehub.cz/wts/${id}`, {
      method: "DELETE",
      ...createAuthHeaders(),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting WTS item:", error);
    throw error;
  }
};

export default api;
