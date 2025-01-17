import { useState, useEffect } from "react";

// import { Navigate } from "react-router";
// import { useAuth } from "./useAuth";

// Import icons for better UI
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const useAuth = () => {
  return {
    user: {
      username: "MockUser", // Mock username
      email: "mockuser@example.com",
    },
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [wtbData, setWtbData] = useState([]);
  const [wtsData, setWtsData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  // Protect the route
  if (!user) {
    //     return <Navigate to="/" />;
    return <div>Loading...</div>;
  }

  // Fetch data based on the active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        let data;

        if (activeTab === "wtb") {
          response = await fetch("https://api.lacehub.cz/wtb/list", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          data = await response.json();
          setWtbData(data);
        } else if (activeTab === "wts") {
          response = await fetch("https://api.lacehub.cz/wts/list", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          data = await response.json();
          setWtsData(data);
        } else if (activeTab === "inventory") {
          response = await fetch("https://api.lacehub.cz/inventory/list", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          data = await response.json();
          setInventoryData(data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} data:`, error);
      }
    };

    fetchData();
  }, [activeTab]); // Dependency array ensures this runs when `activeTab` changes

  return (
    <div className="flex h-screen bg-primary-600">
      {/* Sidebar */}
      <div className="w-64 bg-white h-full shadow-lg">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">LaceHub</h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6">
          <a
            href="#"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-primary-100 hover:text-primary-600"
          >
            <HomeIcon className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-primary-100 hover:text-primary-600"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 mr-3" />
            How does it work
          </a>
          <a
            href="#"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-primary-100 hover:text-primary-600"
          >
            <Cog6ToothIcon className="w-5 h-5 mr-3" />
            Settings
          </a>
          <a
            href="#"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-primary-100 hover:text-primary-600"
          >
            <LifebuoyIcon className="w-5 h-5 mr-3" />
            Support
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for your sneaker"
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {/* Account Icon/Info */}
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">{user.username}</span>
              <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex space-x-4 px-6 py-3">
            <button
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeTab === "wtb"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-primary-100"
              }`}
              onClick={() => setActiveTab("wtb")}
            >
              WTB list
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeTab === "wts"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-primary-100"
              }`}
              onClick={() => setActiveTab("wts")}
            >
              WTS list
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeTab === "inventory"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-primary-100"
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              Inventory
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeTab === "wtb" && (
            <div className="space-y-4">
              {wtbData.length > 0 ? (
                wtbData.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    No WTB listings yet
                  </h3>
                  <p className="text-gray-600">
                    Your Want To Buy listings will appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "wts" && (
            <div className="space-y-4">
              {wtsData.length > 0 ? (
                wtsData.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    No WTS listings yet
                  </h3>
                  <p className="text-gray-600">
                    Your Want To Sell listings will appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              {inventoryData.length > 0 ? (
                inventoryData.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    No items in inventory
                  </h3>
                  <p className="text-gray-600">
                    Your inventory items will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
