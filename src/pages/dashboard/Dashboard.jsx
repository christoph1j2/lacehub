import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Menu,
  X,
  Home,
  HelpCircle,
  Settings,
  LifeBuoy,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../registration/useAuth";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wtb");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const apiEndpoints = {
    wtb: "https://api.lacehub.cz/wtb/user",
    wts: "https://api.lacehub.cz/wts/user",
    inventory: "https://api.lacehub.cz/user-inventory/user",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await fetch(apiEndpoints[activeTab], {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        //log for debugging
        console.log(result);
        setData(result);
        // setData("text/plain", result);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
        setData([]);
        if (err.message === "No authentication token found") {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, navigate]);

  const handleMatchWTB = async () => {
    setMatchingStatus("matching");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api.lacehub.cz/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Matching process failed");
      }
      const result = await response.json();
      setMatchingStatus("success");
      console.log(result);
    } catch (err) {
      setMatchingStatus("error");
      console.error("Matching error:", err);
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  const navItems = [
    { name: "Homepage", icon: Home, path: "/" },
    { name: "How it works", icon: HelpCircle },
    { name: "Settings", icon: Settings },
    { name: "Support", icon: LifeBuoy },
  ];

  return (
    <div className="flex min-h-screen bg-primary-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary-800 text-white p-2 rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-primary-800 text-white shadow-xl transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-6 bg-primary-700">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">LaceHub</h1>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 text-white w-full p-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="mt-auto flex items-center space-x-3 text-white w-full p-2 rounded-lg hover:bg-primary-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-primary-100">
        {/* Header */}
        <header className="bg-primary-700 shadow-md p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search for your sneaker"
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg">
              <span className="text-primary-900">
                Welcome, {user?.username}
              </span>
              <User className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-primary-100">
          <div className="max-w-7xl mx-auto">
            {/* Tabs and Action Button */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {["WTB list", "WTS list", "Inventory"].map((tab) => {
                    const tabKey = tab.toLowerCase().split(" ")[0];
                    return (
                      <button
                        key={tab}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          activeTab === tabKey
                            ? "bg-secondary-500 text-white hover:bg-secondary-600"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setActiveTab(tabKey)}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleMatchWTB}
                  disabled={matchingStatus === "matching"}
                  className="min-w-[200px] px-6 py-3 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md"
                >
                  {matchingStatus === "matching"
                    ? "Matching..."
                    : "Match your WTS list"}
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {matchingStatus === "error" && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md mb-6"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">
                  {" "}
                  The matching process failed. Please try again later.
                </span>
              </div>
            )}
            {matchingStatus === "success" && (
              <div
                className="bg-primary-100 border-l-4 border-primary-500 text-primary-700 px-4 py-3 rounded shadow-md mb-6"
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline">
                  {" "}
                  Matching process completed successfully.
                </span>
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to your {activeTab} dashboard. Here you can manage your
                sneaker collection and trades.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-lg text-primary-600 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              ) : data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={item.product.image_link}
                              alt={item.product.name}
                              className="h-10 w-auto"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-primary-50 rounded-lg p-4 shadow-md">
                  <p className="font-medium text-primary-800">
                    No data available
                  </p>
                  <p className="text-gray-600">
                    Your {activeTab} data will be displayed here once you add
                    some items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
