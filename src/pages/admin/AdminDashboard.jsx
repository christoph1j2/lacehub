import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { subMonths, subWeeks, subYears } from "date-fns";
import { toast } from "sonner";
import {
  fetchTotalUsers,
  fetchActiveUserCount,
  fetchDailyMatches,
  fetchMonthlyRegistrations,
} from "../services/api";

// Helper to format date for API
const formatDateForApi = (date) => {
  return date.toISOString().split("T")[0];
};

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [registrationData, setRegistrationData] = useState([]);
  const [matchingData, setMatchingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regPeriod, setRegPeriod] = useState("month");
  const [matchPeriod, setMatchPeriod] = useState("month");

  // Calculate date ranges based on selected periods
  const dateRanges = useMemo(() => {
    const now = new Date();
    const getDateRange = (period) => {
      let startDate;

      switch (period) {
        case "week":
          startDate = subWeeks(now, 1);
          break;
        case "year":
          startDate = subYears(now, 1);
          break;
        case "month":
        default:
          startDate = subMonths(now, 1);
          break;
      }

      return {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(now),
      };
    };

    return {
      registration: getDateRange(regPeriod),
      matching: getDateRange(matchPeriod),
    };
  }, [regPeriod, matchPeriod]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalUsersData, activeUsersData, dailyMatchesData] =
          await Promise.all([
            fetchTotalUsers(),
            fetchActiveUserCount(),
            fetchDailyMatches(),
          ]);

        setTotalUsers(totalUsersData?.count || 0);
        setActiveUsers(activeUsersData?.count || 0);
        setTotalMatches(dailyMatchesData?.totalMatches || 0);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast("Failed to load dashboard statistics", {
          description: "Please try again later",
          type: "error",
        });
      }
    };

    fetchStats();
  }, []);

  // Fetch registration data when date range changes
  useEffect(() => {
    const fetchRegistrationChart = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMonthlyRegistrations(
          dateRanges.registration.startDate,
          dateRanges.registration.endDate
        );

        // Map API response to chart format
        const chartData = data.labels.map((label, index) => ({
          name: label,
          value: data.counts[index],
        }));

        setRegistrationData(chartData);
      } catch (error) {
        console.error("Error fetching registration data:", error);
        toast("Failed to load registration chart data", {
          description: "Please try again later",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationChart();
  }, [dateRanges.registration]);

  // Fetch matching data when date range changes
  useEffect(() => {
    const fetchMatchingChart = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDailyMatches();

        // Map API response to chart format
        const chartData = data.labels.map((label, index) => ({
          name: label,
          matches: data.counts[index],
        }));

        setMatchingData(chartData);
      } catch (error) {
        console.error("Error fetching matching data:", error);
        toast("Failed to load matching chart data", {
          description: "Please try again later",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchingChart();
  }, [dateRanges.matching]);

  // Stats cards data
  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      description: "Platform users",
    },
    {
      title: "Active Users",
      value: activeUsers.toLocaleString(),
      description: "Currently active users",
    },
    {
      title: "Total Matches",
      value: totalMatches.toLocaleString(),
      description: "Total matches made",
    },
  ];

  // Period options for the select dropdowns
  const periodOptions = [
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "year", label: "Last Year" },
  ];

  if (isLoading && !registrationData.length && !matchingData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform statistics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-primary-200"
          >
            <h3 className="text-sm font-medium text-primary-500">
              {stat.title}
            </h3>
            <div className="mt-2">
              <p className="text-2xl font-bold text-primary-900">
                {stat.value}
              </p>
              <p className="text-xs text-primary-500 mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">New Users Registration</h3>
            <div className="w-36">
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={regPeriod}
                onChange={(e) => setRegPeriod(e.target.value)}
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-primary-500 mb-6">
            User registrations over time
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={registrationData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorRegistration"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#F97316"
                  fillOpacity={1}
                  fill="url(#colorRegistration)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Matching Activity</h3>
            <div className="w-36">
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={matchPeriod}
                onChange={(e) => setMatchPeriod(e.target.value)}
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-primary-500 mb-6">
            Matching activity over time
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={matchingData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar
                  dataKey="matches"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                  name="Matches"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
