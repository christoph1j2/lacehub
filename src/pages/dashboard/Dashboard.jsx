import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../registration/useAuth";

import {
  HomeIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`https://api.lacehub.cz/${activeTab}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
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

  return (
    <div className="flex h-screen bg-primary-100">
      {/* Sidebar */}
      <div className="w-72 bg-primary-800 text-white h-full p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-100 mb-10">
            LaceHub
          </h1>
          <nav className="space-y-6">
            {[
              { name: "Dashboard", icon: HomeIcon },
              { name: "How it works", icon: QuestionMarkCircleIcon },
              { name: "Settings", icon: Cog6ToothIcon },
              { name: "Support", icon: LifebuoyIcon },
            ].map((item) => (
              <button
                key={item.name}
                className="flex items-center text-xl text-secondary-100 hover:text-white transition-colors w-full"
              >
                <item.icon className="h-6 w-6 mr-3" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center text-xl text-secondary-100 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-primary-500 text-white shadow-lg p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for your sneaker"
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-secondary-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
              </div>
            </div>
            <div className="flex items-center ml-4 hover:bg-primary-600 rounded-full px-3 py-1 transition-colors">
              <span className="mr-2 text-lg">{user?.username}</span>
              <UserCircleIcon className="h-10 w-10 text-secondary-500" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* Tab Buttons and CTA */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
              <div className="flex space-x-4">
                {["WTB list", "WTS list", "Inventory"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-3 rounded-full font-medium transition-colors text-lg ${
                      activeTab === tab.toLowerCase().split(" ")[0]
                        ? "bg-secondary-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      setActiveTab(tab.toLowerCase().split(" ")[0])
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={handleMatchWTB}
                disabled={matchingStatus === "matching"}
                className="px-6 py-3 bg-accent-500 text-white rounded-full font-medium text-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {matchingStatus === "matching"
                  ? "Matching..."
                  : "Match your WTB list"}
              </button>
            </div>

            {/* Status Messages */}
            {matchingStatus === "error" && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
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
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline">
                  {" "}
                  Matching process completed successfully.
                </span>
              </div>
            )}

            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-secondary-800 mb-6">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Welcome to your {activeTab} dashboard. Here you can manage your
                sneaker collection and trades.
              </p>

              {/* Data Display */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-lg text-primary-600 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              ) : data.length > 0 ? (
                <ul className="space-y-4">
                  {data.map((item, index) => (
                    <li
                      key={index}
                      className="bg-primary-50 border border-primary-200 rounded-md p-4"
                    >
                      <h3 className="font-bold text-primary-800">
                        {item.title}
                      </h3>
                      <p className="text-primary-600">{item.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-primary-50 border border-primary-200 rounded-md p-4 text-primary-800">
                  <p className="font-medium">No data available</p>
                  <p>
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
