import { useState, useEffect } from "react";
import {
  BarChart,
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths } from "date-fns";
const AdminDashboard = () => {
  const [registrationData, setRegistrationData] = useState([]);
  const [matchingData, setMatchingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Generate mock data for registration chart
        const mockRegistrationData = Array.from({ length: 6 }, (_, i) => {
          const date = subMonths(new Date(), i);
          return {
            name: format(date, "MMM"),
            value: Math.floor(Math.random() * 45) + 15, // Random between 15-60
          };
        }).reverse();
        // Generate mock data for matching chart
        const mockMatchingData = Array.from({ length: 7 }, (_, i) => {
          return {
            name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
            wtb: Math.floor(Math.random() * 50) + 10,
            wts: Math.floor(Math.random() * 40) + 5,
          };
        });
        setRegistrationData(mockRegistrationData);
        setMatchingData(mockMatchingData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  // Stats data
  const stats = [
    {
      title: "Total Users",
      value: "12,486",
      description: "↗︎ 2,430 (18.6%) from last month",
    },
    {
      title: "Active Users",
      value: "8,941",
      description: "↗︎ 1,210 (13.5%) from last month",
    },
    {
      title: "Total Matches",
      value: "3,842",
      description: "↗︎ 842 (21.9%) from last month",
    },
    {
      title: "Conversion Rate",
      value: "26.8%",
      description: "↘︎ 1.1% from last month",
    },
  ];
  if (isLoading) {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <h3 className="text-lg font-medium mb-4">New Users Registration</h3>
          <p className="text-sm text-primary-500 mb-6">
            Monthly user registrations over time
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
          <h3 className="text-lg font-medium mb-4">Matching Activity</h3>
          <p className="text-sm text-primary-500 mb-6">
            Weekly WTB and WTS matching activity
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
                  dataKey="wtb"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                  name="WTB Matches"
                />
                <Bar
                  dataKey="wts"
                  fill="#1F2937"
                  radius={[4, 4, 0, 0]}
                  name="WTS Matches"
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
