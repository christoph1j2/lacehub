// API service for admin panel

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

// Function to fetch total users count
export const fetchTotalUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/total-users",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching total users:", error);
    return { count: 0 };
  }
};

// Function to fetch active user count
export const fetchActiveUserCount = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/users/admin/active-user-count",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching active users:", error);
    return { count: 0 };
  }
};

// Function to fetch daily matches
export const fetchDailyMatches = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz/matches/admin/daily-matches",
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching daily matches:", error);
    return { labels: [], counts: [], totalMatches: 0 };
  }
};

// Function to fetch monthly registrations
export const fetchMonthlyRegistrations = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `https://api.lacehub.cz/users/admin/monthly-register?startDate=${startDate}&endDate=${endDate}`,
      createAuthHeaders()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching monthly registrations:", error);
    return { labels: [], counts: [], totalRegistered: 0 };
  }
};

// Function to fetch all users
export const fetchAllUsers = async () => {
  try {
    const response = await fetch(
      "https://api.lacehub.cz//users",
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

// Function to fetch active users
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

// Function to fetch inactive users
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

// Function to fetch banned users
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

// Function to ban a user
export const banUser = async (userId) => {
  try {
    const response = await fetch(
      `https://api.lacehub.cz/users/admin/${userId}/ban`,
      {
        method: "POST",
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

// Function to unban a user
export const unbanUser = async (userId) => {
  try {
    const response = await fetch(
      `https://api.lacehub.cz/users/admin/${userId}/unban`,
      {
        method: "POST",
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
