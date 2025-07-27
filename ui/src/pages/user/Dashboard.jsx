import UserLayout from "../../layout/UserLayout";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Save, Trash, ChevronDown, Upload } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditCell, setActiveEditCell] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [currentEditField, setCurrentEditField] = useState(null);
  const [tempEditValue, setTempEditValue] = useState("");
  const [itemsToDelete, setItemsToDelete] = useState({});
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Handle clicks outside the edit modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEditModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setShowEditModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEditModal]);

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
      setItemsToDelete({});
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

  // Handle file upload for inventory
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if the file is an .xlsx file
    if (!file.name.endsWith(".xlsx")) {
      toast.error("Please upload a valid Excel (.xlsx) file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("https://api.lacehub.cz/user-inventory/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Upload failed");
        toast.success("File uploaded successfully");
        fetchData(); // Refresh the data
      })
      .catch((error) => {
        console.error("Upload error:", error);
        toast.error(`Failed to upload file: ${error.message}`);
      })
      .finally(() => {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
  };

  // Handle click on editable cells
  const handleCellClick = (itemId, field, currentValue) => {
    setCurrentEditItem(data.find((item) => item.id === itemId));
    setCurrentEditField(field);
    setTempEditValue(currentValue);
    setShowEditModal(true);
  };

  // Handle selecting a new value
  const handleSelectChange = () => {
    if (currentEditItem && currentEditField) {
      setEditedItems((prev) => ({
        ...prev,
        [currentEditItem.id]: {
          ...(prev[currentEditItem.id] || {}),
          [currentEditField]: tempEditValue,
        },
      }));
      setShowEditModal(false);
    }
  };

  // Handle marking an item for deletion
  const handleMarkForDeletion = (itemId) => {
    setItemsToDelete((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Handle saving all changes, including deletions
  const handleSaveChanges = async () => {
    const hasEdits = Object.keys(editedItems).length > 0;
    const hasDeletions =
      Object.keys(itemsToDelete).filter((id) => itemsToDelete[id]).length > 0;

    if (!hasEdits && !hasDeletions) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    let hasErrors = false;

    try {
      // First, handle edits
      for (const [itemId, changes] of Object.entries(editedItems)) {
        try {
          if (activeTab === "wtb") {
            await api.updateWtbItem(itemId, changes);
          } else if (activeTab === "wts") {
            await api.updateWtsItem(itemId, changes);
          } else if (activeTab === "inventory") {
            // Add inventory update endpoint here when available
            const token = localStorage.getItem("token");
            if (!token) {
              throw new Error("No authentication token found");
            }

            await fetch(`https://api.lacehub.cz/user-inventory/${itemId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(changes),
            });
          }
        } catch (err) {
          console.error(`Error updating item ${itemId}:`, err);
          hasErrors = true;
        }
      }

      // Then, handle deletions
      const deletionPromises = Object.keys(itemsToDelete)
        .filter((id) => itemsToDelete[id])
        .map(async (itemId) => {
          try {
            if (activeTab === "wtb") {
              await api.deleteWtbItem(itemId);
            } else if (activeTab === "wts") {
              await api.deleteWtsItem(itemId);
            } else if (activeTab === "inventory") {
              const token = localStorage.getItem("token");
              if (!token) {
                throw new Error("No authentication token found");
              }

              await fetch(`https://api.lacehub.cz/user-inventory/${itemId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            }
            return itemId;
          } catch (err) {
            console.error(`Error deleting item ${itemId}:`, err);
            hasErrors = true;
            return null;
          }
        });

      const deletedIds = (await Promise.all(deletionPromises)).filter(
        (id) => id !== null
      );

      // Update UI to remove deleted items
      if (deletedIds.length > 0) {
        setData((prev) => prev.filter((item) => !deletedIds.includes(item.id)));
      }

      if (hasErrors) {
        toast.error("Some items could not be updated. Please try again.");
      } else {
        toast.success("All changes saved successfully");
        setEditedItems({});
        setItemsToDelete({});
        fetchData(); // Refresh data to show updated state
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
  const isMarkedForDeletion = (itemId) => {
    return itemsToDelete[itemId] === true;
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
    Object.keys(editedItems).length > 0 ||
    Object.values(itemsToDelete).some((value) => value === true);

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
          {activeTab === "inventory" && (
            <>
              <input
                type="file"
                accept=".xlsx"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="min-w-[200px] px-6 py-3 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transform hover:-translate-y-1 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Upload .xlsx file
              </button>
            </>
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
                      isMarkedForDeletion(item.id) ? "bg-accent-100/30" : ""
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
                            isItemEdited(item.id) && editedItems[item.id].size
                              ? "border-secondary-500 bg-secondary-100/20"
                              : "border-primary-200 hover:border-secondary-400"
                          } transition-all duration-200`}
                        >
                          <span>{getCurrentValue(item, "size")}</span>
                          <ChevronDown className="h-4 w-4 ml-1 text-primary-500" />
                        </button>
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
                            editedItems[item.id].quantity
                              ? "border-secondary-500 bg-secondary-100/20"
                              : "border-primary-200 hover:border-secondary-400"
                          } transition-all duration-200`}
                        >
                          <span>{getCurrentValue(item, "quantity")}</span>
                          <ChevronDown className="h-4 w-4 ml-1 text-primary-500" />
                        </button>
                      </div>
                    </td>

                    {/* Actions Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleMarkForDeletion(item.id)}
                        className={`p-2 ${
                          isMarkedForDeletion(item.id)
                            ? "text-accent-600 bg-accent-100"
                            : "text-accent-500 hover:text-accent-700 hover:bg-accent-100"
                        } rounded-full transition-colors duration-150`}
                        title={
                          isMarkedForDeletion(item.id)
                            ? "Unmark for deletion"
                            : "Mark for deletion"
                        }
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>

                    {/* Description Cell (only for inventory) */}
                    {activeTab === "inventory" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                        {item.product.description || "N/A"}
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

      {/* Modal for editing (similar to SearchBarResult) */}
      {showEditModal && currentEditItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-primary-800 mb-1">
              Edit {currentEditField === "size" ? "Size" : "Quantity"}
            </h3>
            <p className="text-primary-600 text-sm mb-4">
              {currentEditItem.product.name}
            </p>

            <div className="space-y-4">
              {currentEditField === "size" ? (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Size
                  </label>
                  <select
                    value={tempEditValue}
                    onChange={(e) => setTempEditValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-primary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-secondary-400"
                  >
                    {sizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Quantity
                  </label>
                  <select
                    value={tempEditValue}
                    onChange={(e) => setTempEditValue(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-primary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-secondary-400"
                  >
                    {quantityOptions.map((qty) => (
                      <option key={qty} value={qty}>
                        {qty}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSelectChange}
                  className="px-4 py-2 bg-secondary-500 rounded-md text-white hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <UserLayout>
      <DashboardContent />
    </UserLayout>
  );
};

export default Dashboard;
