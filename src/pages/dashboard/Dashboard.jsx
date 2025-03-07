import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Menu,
  X,
  Home,
  HelpCircle,
  Settings,
  LifeBuoy,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import SearchBar from "./SearchBar";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wtb");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [matchingError, setMatchingError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const apiEndpoints = {
    wtb: "https://api.lacehub.cz/wtb/user",
    wts: "https://api.lacehub.cz/wts/user",
    inventory: "https://api.lacehub.cz/user-inventory/user",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

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
      console.log(result);
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

  useEffect(() => {
    fetchData();
  }, [activeTab, navigate]);

  const handleMatch = async () => {
    setMatchingStatus("matching");
    setMatchingError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const matchEndpoint =
        activeTab === "wtb"
          ? "https://api.lacehub.cz/matches/my-buyer-matches"
          : "https://api.lacehub.cz/matches/my-seller-matches";

      const response = await fetch(matchEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        navigate("/");
        throw new Error("Authentication token expired");
      }

      if (response.status === 404) {
        setMatchingStatus("error");
        setMatchingError(
          "No matches found. Try adjusting your preferences or check back later."
        );
        return;
      }

      if (response.status === 429) {
        setMatchingStatus("error");
        setMatchingError(
          "Please wait 2 minutes between matching attempts. You can try matching your list again shortly."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Matching process failed");
      }

      const result = await response.json();
      setMatchingStatus("success");
      console.log(result);
    } catch (err) {
      setMatchingStatus("error");
      console.error("Matching error:", err);

      if (!matchingError) {
        setMatchingError(
          "The matching process failed. Please try again later."
        );
      }

      if (
        err.message === "No authentication token found" ||
        err.message === "Authentication token expired"
      ) {
        logout();
        navigate("/");
      }
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

  const handleItemAdded = () => {
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-primary-100">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-primary-800 text-accent-100 shadow-xl transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-6">
          <button
            className="absolute top-4 right-4 p-1 rounded-full bg-primary-700 text-accent-100 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-secondary-500">LaceHub</h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center w-full p-3 rounded-lg text-accent-100 hover:bg-primary-700 hover:pl-4 transition-all duration-200"
                >
                  <item.icon className="h-5 w-5 mr-3" />
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
            className="mt-auto flex items-center w-full p-3 rounded-lg text-accent-100 hover:bg-primary-700 hover:pl-4 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-primary-100">
        <header className="bg-primary-800 shadow-md p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3 md:hidden">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-accent-100 hover:bg-primary-700 transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={() => navigate("/user-settings")}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg hover:bg-primary-100 transition-all duration-200"
              >
                <span className="text-sm text-primary-800">
                  Welcome {user?.username}
                </span>
                <User className="h-5 w-5 text-primary-800" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <SearchBar onAddItem={handleItemAdded} />
              </div>

              <button
                onClick={() => navigate("/user-settings")}
                className="hidden md:flex items-center gap-2 bg-white px-4 py-3 rounded-lg hover:bg-primary-100 transition-all duration-200 ml-auto"
              >
                <span className="whitespace-nowrap text-primary-800">
                  Welcome {user?.username}
                </span>
                <User className="h-5 w-5 text-primary-800" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-primary-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {["WTB list", "WTS list", "Inventory"].map((tab) => {
                    const tabKey = tab.toLowerCase().split(" ")[0];
                    return (
                      <button
                        key={tab}
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          activeTab === tabKey
                            ? "bg-secondary-100 text-secondary-800 shadow-sm"
                            : "bg-white text-primary-700 hover:bg-primary-100"
                        }`}
                        onClick={() => setActiveTab(tabKey)}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
                {activeTab !== "inventory" && (
                  <button
                    onClick={handleMatch}
                    disabled={matchingStatus === "matching"}
                    className="min-w-[200px] px-6 py-3 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transform hover:-translate-y-1 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                  >
                    {matchingStatus === "matching"
                      ? "Matching..."
                      : activeTab === "wtb"
                      ? "Match your WTB list"
                      : "Match your WTS list"}
                  </button>
                )}
              </div>
            </div>

            {matchingStatus === "error" && (
              <div
                className="bg-accent-100 border-l-4 border-accent-500 text-accent-700 px-4 py-3 rounded shadow-md mb-6"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {matchingError}</span>
              </div>
            )}
            {matchingStatus === "success" && (
              <div
                className="bg-secondary-100 border-l-4 border-secondary-500 text-secondary-700 px-4 py-3 rounded shadow-md mb-6"
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline">
                  {" "}
                  Matching process completed successfully.
                </span>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-3xl font-bold text-primary-800 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Dashboard
              </h2>
              <p className="text-primary-600 mb-6">
                Welcome to your {activeTab} dashboard. Here you can manage your
                sneaker collection and trades.
              </p>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-secondary-600 mx-auto"></div>
                  <p className="text-lg text-primary-600 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div
                  className="bg-accent-100 border-l-4 border-accent-500 text-accent-700 px-4 py-3 rounded shadow-md"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              ) : data.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-primary-200">
                  <table className="min-w-full divide-y divide-primary-200">
                    <thead className="bg-primary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-primary-200">
                      {data.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-primary-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={item.product.image_link}
                              alt={item.product.name}
                              className="h-12 w-auto object-contain"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-800">
                            {item.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                            {item.product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                            {item.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                            {item.product.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-primary-50 rounded-lg p-6 shadow-sm border border-primary-200">
                  <p className="font-medium text-lg text-primary-800 mb-2">
                    No data available
                  </p>
                  <p className="text-primary-600">
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
