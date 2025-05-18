import UserLayout from "../../layout/UserLayout";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Save, Trash, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import * as api from "../../services/api";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wtb");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [matchingError, setMatchingError] = useState(null);
  const [editedItems, setEditedItems] = useState({});
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditCell, setActiveEditCell] = useState(null);
  const dropdownRef = useRef(null);

  // Size options for dropdown
  const sizeOptions = [
    "US 4",
    "US 4.5",
    "US 5",
    "US 5.5",
    "US 6",
    "US 6.5",
    "US 7",
    "US 7.5",
    "US 8",
    "US 8.5",
    "US 9",
    "US 9.5",
    "US 10",
    "US 10.5",
    "US 11",
    "US 11.5",
    "US 12",
    "US 12.5",
    "US 13",
    "US 13.5",
    "US 14",
    "US 15",
  ];

  // Quantity options
  const quantityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const apiEndpoints = {
    wtb: "https://api.lacehub.cz/wtb/user",
    wts: "https://api.lacehub.cz/wts/user",
    inventory: "https://api.lacehub.cz/user-inventory/user",
  };

  const deleteEndpoints = {
    wtb: (id) => `https://api.lacehub.cz/wtb/${id}`,
    wts: (id) => `https://api.lacehub.cz/wts/${id}`,
    inventory: (id) => `https://api.lacehub.cz/user-inventory/${id}`,
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeEditCell &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveEditCell(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeEditCell]);

  // Fetch data from API
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
      setEditedItems({});
      setItemsToDelete([]);
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

  // Handle matching
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
        method: "GET",
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

  // Handle click on editable cells
  const handleCellClick = (itemId, field, currentValue) => {
    setActiveEditCell({
      id: itemId,
      field,
      value: currentValue,
    });
  };

  // Handle selecting a new value from dropdown
  const handleSelectChange = (itemId, field, newValue) => {
    setEditedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: newValue,
      },
    }));
    setActiveEditCell(null);
  };

  // Handle marking an item for deletion
  const handleMarkForDeletion = (itemId) => {
    setItemsToDelete((prev) => [...prev, itemId]);
    setData((prevData) =>
      prevData.map((item) =>
        item.id === itemId ? { ...item, markedForDeletion: true } : item
      )
    );
    toast.info("Item marked for deletion. Click Save Changes to confirm.");
  };

  // Handle saving all changes
  const handleSaveChanges = async () => {
    if (Object.keys(editedItems).length === 0 && itemsToDelete.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    let hasErrors = false;

    try {
      // Process each edited item one by one
      for (const [itemId, changes] of Object.entries(editedItems)) {
        try {
          if (activeTab === "wtb") {
            await api.updateWtbItem(itemId, changes);
          } else if (activeTab === "wts") {
            await api.updateWtsItem(itemId, changes);
          } else if (activeTab === "inventory") {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `https://api.lacehub.cz/user-inventory/${itemId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(changes),
              }
            );
            if (!response.ok)
              throw new Error("Failed to update inventory item");
          }
        } catch (err) {
          console.error(`Error updating item ${itemId}:`, err);
          hasErrors = true;
        }
      }

      // Process all items marked for deletion
      for (const itemId of itemsToDelete) {
        try {
          const token = localStorage.getItem("token");
          const deleteUrl = deleteEndpoints[activeTab](itemId);

          const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error(`Failed to delete item ${itemId}`);
        } catch (err) {
          console.error(`Error deleting item ${itemId}:`, err);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        toast.error("Some items could not be updated. Please try again.");
      } else {
        toast.success("All changes saved successfully");
        if (itemsToDelete.length > 0) {
          setData((prevData) =>
            prevData.filter((item) => !itemsToDelete.includes(item.id))
          );
        }
        setEditedItems({});
        setItemsToDelete([]);
        fetchData();
      }
    } catch (err) {
      console.error("Error saving changes:", err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemAdded = () => {
    fetchData();
  };

  // Check if an item has been edited
  const isItemEdited = (itemId) => {
    return editedItems[itemId] !== undefined;
  };

  // Check if an item is marked for deletion
  const isItemMarkedForDeletion = (itemId) => {
    return (
      itemsToDelete.includes(itemId) ||
      data.find((item) => item.id === itemId)?.markedForDeletion
    );
  };

  // Get current edited or original value
  const getCurrentValue = (item, field) => {
    if (editedItems[item.id] && editedItems[item.id][field] !== undefined) {
      return editedItems[item.id][field];
    }
    return item[field];
  };

  // Determine if Save Changes button should be enabled
  const hasPendingChanges =
    Object.keys(editedItems).length > 0 || itemsToDelete.length > 0;

  // The actual dashboard content to be rendered
  const DashboardContent = () => (
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
          {activeTab !== "inventory" ? (
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
          ) : (
            <div>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx,.xls"
              />
              <label
                htmlFor="file-upload"
                className="min-w-[200px] px-6 py-3 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transform hover:-translate-y-1 transition-all duration-300 shadow-md cursor-pointer inline-block text-center whitespace-nowrap"
              >
                Upload .xlsx file
              </label>
            </div>
          )}
        </div>
      </div>

      {matchingStatus === "error" && (
        <div
          className="bg-accent-100 border-l-4 border-accent-500 text-accent-700 px-4 py-3 rounded shadow-md mb-6 animate-fade-in"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {matchingError}</span>
        </div>
      )}
      {matchingStatus === "success" && (
        <div
          className="bg-secondary-100 border-l-4 border-secondary-500 text-secondary-700 px-4 py-3 rounded shadow-md mb-6 animate-fade-in"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">
            {" "}
            Matching process completed successfully. Please check your email.
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-primary-800">
              {activeTab.toUpperCase()} Dashboard
            </h2>
            <p className="text-primary-600 mt-1">
              Manage your{" "}
              {activeTab === "wtb"
                ? "want to buy"
                : activeTab === "wts"
                ? "want to sell"
                : "inventory"}{" "}
              items
            </p>
          </div>

          <button
            onClick={handleSaveChanges}
            disabled={!hasPendingChanges || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              hasPendingChanges
                ? "bg-secondary-500 text-white hover:bg-secondary-600 shadow-md"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-secondary-600 mx-auto"></div>
            <p className="text-lg text-primary-600 mt-4">Loading...</p>
          </div>
        ) : error ? (
          <div
            className="bg-accent-100 border-l-4 border-accent-500 text-accent-700 px-4 py-3 rounded shadow-md animate-fade-in"
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
                    Actions
                  </th>
                  {activeTab === "inventory" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Description
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {data.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-primary-50 transition-colors duration-150 ${
                      isItemEdited(item.id) ? "bg-secondary-100/30" : ""
                    } ${
                      isItemMarkedForDeletion(item.id) ? "bg-accent-100/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-14 w-14 relative">
                        <img
                          src={item.product.image_link}
                          alt={item.product.name}
                          className="h-full w-full object-contain rounded-md"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-800">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                      {item.product.sku}
                    </td>

                    {/* Size Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                      <div className="relative">
                        <button
                          onClick={() =>
                            handleCellClick(item.id, "size", item.size)
                          }
                          className={`flex items-center justify-between w-24 px-3 py-1.5 rounded border ${
                            isItemEdited(item.id) && editedItems[item.id]?.size
                              ? "border-secondary-500 bg-secondary-100/20"
                              : "border-primary-200 hover:border-secondary-400"
                          } transition-all duration-200`}
                          disabled={isItemMarkedForDeletion(item.id)}
                        >
                          <span>{getCurrentValue(item, "size")}</span>
                          <ChevronDown className="h-4 w-4 ml-1 text-primary-500" />
                        </button>

                        {activeEditCell &&
                          activeEditCell.id === item.id &&
                          activeEditCell.field === "size" && (
                            <div
                              ref={dropdownRef}
                              className="absolute top-full left-0 mt-1 w-32 bg-white border border-primary-200 rounded-md shadow-lg z-50 animate-scale-in transform origin-top"
                              style={{ maxHeight: "200px", overflowY: "auto" }}
                            >
                              <div className="py-1">
                                {sizeOptions.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() =>
                                      handleSelectChange(item.id, "size", size)
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-secondary-100 transition-colors duration-150"
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Quantity Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                      <div className="relative">
                        <button
                          onClick={() =>
                            handleCellClick(item.id, "quantity", item.quantity)
                          }
                          className={`flex items-center justify-between w-24 px-3 py-1.5 rounded border ${
                            isItemEdited(item.id) &&
                            editedItems[item.id]?.quantity
                              ? "border-secondary-500 bg-secondary-100/20"
                              : "border-primary-200 hover:border-secondary-400"
                          } transition-all duration-200`}
                          disabled={isItemMarkedForDeletion(item.id)}
                        >
                          <span>{getCurrentValue(item, "quantity")}</span>
                          <ChevronDown className="h-4 w-4 ml-1 text-primary-500" />
                        </button>

                        {activeEditCell &&
                          activeEditCell.id === item.id &&
                          activeEditCell.field === "quantity" && (
                            <div
                              ref={dropdownRef}
                              className="absolute top-full left-0 mt-1 w-24 bg-white border border-primary-200 rounded-md shadow-lg z-50 animate-scale-in transform origin-top"
                              style={{ maxHeight: "200px", overflowY: "auto" }}
                            >
                              <div className="py-1">
                                {quantityOptions.map((qty) => (
                                  <button
                                    key={qty}
                                    onClick={() =>
                                      handleSelectChange(
                                        item.id,
                                        "quantity",
                                        qty
                                      )
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-secondary-100 transition-colors duration-150"
                                  >
                                    {qty}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Actions Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleMarkForDeletion(item.id)}
                        disabled={isItemMarkedForDeletion(item.id)}
                        className={`p-2 ${
                          isItemMarkedForDeletion(item.id)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-accent-500 hover:text-accent-700 hover:bg-accent-100"
                        } rounded-full transition-colors duration-150`}
                        title={
                          isItemMarkedForDeletion(item.id)
                            ? "Marked for deletion"
                            : "Remove item"
                        }
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>

                    {/* Description Cell (only for inventory) */}
                    {activeTab === "inventory" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                        {item.product.description}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-primary-50 rounded-lg p-6 shadow-sm border border-primary-200 animate-fade-in">
            <p className="font-medium text-lg text-primary-800 mb-2">
              No data available
            </p>
            <p className="text-primary-600">
              Your {activeTab} data will be displayed here once you add some
              items.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <UserLayout>
      <DashboardContent />
    </UserLayout>
  );
};

export default Dashboard;
