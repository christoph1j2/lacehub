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

export default api;
