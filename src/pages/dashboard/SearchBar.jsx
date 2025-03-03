import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import SearchResult from "./SearchBarResult";
import { toast } from "sonner";

const SearchBar = ({ onAddItem }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const searchProducts = async (searchQuery) => {
    if (searchQuery.trim() === "") return;

    setLoading(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `https://api.lacehub.cz/products/search?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (itemData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(itemData.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: itemData.productId,
          size: itemData.size,
          quantity: itemData.quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      // Notify parent component to refresh the list
      if (onAddItem) {
        onAddItem();
      }

      const listType = itemData.endpoint.split("/").pop();
      toast.success(`Item added to your ${listType} list successfully!`);
    } catch (error) {
      console.error("Add item error:", error);
      toast.error("Failed to add item. Please try again.");
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for your sneaker"
          className="w-full pl-10 pr-10 py-3 rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() !== "" && setShowResults(true)}
          aria-label="Search sneakers"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-primary-100 overflow-hidden z-30">
          <div className="p-2">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary-500 border-t-transparent"></div>
                <span className="ml-2 text-primary-600">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto p-2">
                {results.map((product) => (
                  <SearchResult
                    key={product.id}
                    product={product}
                    onAddToList={handleAddToList}
                  />
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-primary-600">
                No results found for "{query}"
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
