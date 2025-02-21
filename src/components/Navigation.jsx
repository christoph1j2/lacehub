import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "../pages/registration/useAuth";
import { NavLink, useLocation } from "react-router";

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        setIsScrolled(false);
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
        setIsScrolled(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navClass =
    location.pathname !== "/"
      ? "bg-primary-600"
      : isScrolled
      ? "bg-primary-600"
      : "bg-transparent hover:bg-primary-600";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${navClass} ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold text-2xl duration-300">
            <NavLink to="/">LaceHub</NavLink>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/how-it-works"
              className="text-white hover:text-primary-200 transition-colors"
            >
              How It Works
            </NavLink>
            <NavLink
              to="/about"
              className="text-white hover:text-primary-200 transition-colors"
            >
              About
            </NavLink>
            <NavLink
              to="/contacts"
              className="text-white hover:text-primary-200 transition-colors"
            >
              Contact
            </NavLink>

            {user ? (
              <div className="flex items-center space-x-4">
                <NavLink
                  to="/dashboard"
                  className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-2 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Dashboard
                </NavLink>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-secondary-600 text-white px-4 py-2 rounded-full hover:bg-secondary-700 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>{user.username}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <NavLink
                        to="/settings"
                        className="block px-4 py-2 text-primary-800 hover:bg-primary-100"
                      >
                        Settings
                      </NavLink>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-primary-800 hover:bg-primary-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {}}
                className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                Register
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 h-[75vh] bg-primary-600 md:hidden overflow-y-auto shadow-lg">
              <div className="px-6 py-6 pb-12 space-y-4">
                <NavLink
                  to="/how-it-works"
                  className="block text-white hover:text-primary-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  How It Works
                </NavLink>
                <NavLink
                  to="/about"
                  className="block text-white hover:text-primary-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </NavLink>
                <NavLink
                  to="/contacts"
                  className="block text-white hover:text-primary-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </NavLink>
                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className="block bg-accent-600 text-white px-6 py-3 rounded-full text-center shadow-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                    <div className="pt-4 mt-4 border-t border-primary-500">
                      <div className="flex items-center space-x-2 text-white mb-4 bg-secondary-600 p-3 rounded-lg">
                        <User className="h-5 w-5" />
                        <span>{user.username}</span>
                      </div>
                      <NavLink
                        to="/settings"
                        className="block text-white hover:text-primary-200 py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Settings
                      </NavLink>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="block text-white hover:text-primary-200 w-full text-left py-2"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {}}
                    className="block w-full bg-accent-600 text-white px-6 py-3 rounded-full text-center shadow-md"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
