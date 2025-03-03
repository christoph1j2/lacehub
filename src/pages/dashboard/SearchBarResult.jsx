import { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Package, ShoppingCart } from "lucide-react";

const SearchBarResult = ({ product, onAddToList }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [listType, setListType] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const menuRef = useRef(null);
  const formRef = useRef(null);

  const handleAddToList = (type) => {
    setListType(type);
    setShowForm(true);
    setIsMenuOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddToList({
      productId: product.id,
      size,
      quantity: Number(quantity),
      endpoint: getEndpoint(),
    });
    setShowForm(false);
    setSize("");
    setQuantity(1);
  };

  const getEndpoint = () => {
    switch (listType) {
      case "wtb":
        return "https://api.lacehub.cz/wtb";
      case "wts":
        return "https://api.lacehub.cz/wts";
      case "inventory":
        return "https://api.lacehub.cz/user-inventory";
      default:
        return "";
    }
  };

  const getListTypeName = () => {
    switch (listType) {
      case "wtb":
        return "Want to Buy";
      case "wts":
        return "Want to Sell";
      case "inventory":
        return "Inventory";
      default:
        return "";
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (
        formRef.current &&
        !formRef.current.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setShowForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sizes for sneakers
  const commonSizes = [
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
    "US 13",
  ];

  // Use a placeholder image if none is available
  const imageSrc =
    product.img_url ||
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&h=200&q=80";

  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 mb-3 group">
      <div className="flex-shrink-0 h-20 w-20 mr-4 overflow-hidden rounded-md bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-primary-800 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-primary-600">SKU: {product.sku}</p>
      </div>

      <div className="relative ml-4" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full text-primary-600 hover:bg-primary-50 hover:text-primary-800 transition-all duration-200"
          aria-label="Options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={() => handleAddToList("wtb")}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-primary-700 hover:bg-primary-50"
                role="menuitem"
              >
                <ShoppingCart className="mr-2 h-4 w-4 text-primary-600" />
                Add to WTB list
              </button>
              <button
                onClick={() => handleAddToList("wts")}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-primary-700 hover:bg-primary-50"
                role="menuitem"
              >
                <Plus className="mr-2 h-4 w-4 text-primary-600" />
                Add to WTS list
              </button>
              <button
                onClick={() => handleAddToList("inventory")}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-primary-700 hover:bg-primary-50"
                role="menuitem"
              >
                <Package className="mr-2 h-4 w-4 text-primary-600" />
                Add to Inventory list
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            ref={formRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-primary-800 mb-1">
              Add to {getListTypeName()}
            </h3>
            <p className="text-primary-600 text-sm mb-4">{product.name}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-primary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-secondary-400"
                >
                  <option value="">Select size</option>
                  {commonSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-primary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-secondary-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary-500 rounded-md text-white hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBarResult;
