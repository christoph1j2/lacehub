import { useState } from "react";
import { useAuth } from "../../pages/registration/useAuth";
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary-100 text-primary-800 text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-primary-100">
      {/* Sidebar */}
      <div className="w-72 bg-secondary-700 text-white h-full p-6">
        <h1 className="text-3xl font-bold text-secondary-100 mb-10">LaceHub</h1>
        <nav className="space-y-6">
          {[
            { name: "Dashboard", icon: HomeIcon },
            { name: "How it works", icon: QuestionMarkCircleIcon },
            { name: "Settings", icon: Cog6ToothIcon },
            { name: "Support", icon: LifebuoyIcon },
          ].map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center text-xl text-secondary-100 hover:text-white transition-colors"
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>
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
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-primary-400 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-200" />
              </div>
            </div>
            <div className="flex items-center ml-4">
              <span className="mr-2 text-lg">{user.username}</span>
              <div className="w-10 h-10 rounded-full bg-secondary-300 flex items-center justify-center text-secondary-800 font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto px-4">
            {" "}
            {/* Added horizontal padding */}
            {/* Tab Buttons */}
            <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex space-x-4">
              {["WTB list", "WTS list", "Inventory"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 rounded-full font-medium transition-colors text-lg ${
                    activeTab === tab.toLowerCase().split(" ")[0]
                      ? "bg-extraColor1-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab.toLowerCase().split(" ")[0])}
                >
                  {tab}
                </button>
              ))}
            </div>
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
              <div className="bg-primary-50 border border-primary-200 rounded-md p-4 text-primary-800">
                <p className="font-medium">No data available</p>
                <p>
                  Your {activeTab} data will be displayed here once you add some
                  items.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
