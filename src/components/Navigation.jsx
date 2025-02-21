import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../pages/registration/useAuth";
import RegisterForm from "../pages/registration/RegisterForm";
import LoginForm from "../pages/registration/LoginForm";
import { NavLink, useLocation } from "react-router";

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false); // Initialize to false
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navClass =
    location.pathname !== "/"
      ? "bg-primary-600"
      : isScrolled
      ? "bg-primary-600"
      : "bg-transparent hover:bg-primary-600";

  return (
    <>
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
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <XMarkIcon className="h-8 w-8" />
              ) : (
                <Bars3Icon className="h-8 w-8" />
              )}
            </button>

            {/* Desktop menu */}
            <ul className="hidden md:flex space-x-6 items-center">
              <li>
                <NavLink
                  to="/how-it-works"
                  className="text-white px-4 py-2 rounded-full transition-all hover:bg-primary-700"
                >
                  How Does It Work?
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className="text-white px-4 py-2 rounded-full transition-all hover:bg-primary-700"
                >
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contacts"
                  className="text-white px-4 py-2 rounded-full transition-all hover:bg-primary-700"
                >
                  Contact Us
                </NavLink>
              </li>
              {!user ? (
                <li>
                  <button
                    onClick={() => setShowRegisterForm(true)}
                    className="bg-accent-500 text-white px-4 py-2 rounded-full hover:bg-accent-600 transition duration-300"
                  >
                    Register
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <NavLink
                      to="/dashboard"
                      className="bg-accent-500 text-white px-4 py-2 rounded-full hover:bg-accent-600 transition duration-300"
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="text-white px-4 py-2 rounded-full transition-all hover:bg-primary-700"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>

            {/* Mobile menu */}
            {isOpen && (
              <ul className="md:hidden absolute top-16 left-0 right-0 py-4 bg-primary-600 space-y-4 shadow-lg">
                <li>
                  <NavLink
                    to="/how-it-works"
                    className="text-white block px-4 py-2 hover:bg-primary-700"
                  >
                    How Does It Work?
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className="text-white block px-4 py-2 hover:bg-primary-700"
                  >
                    About Us
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contacts"
                    className="text-white block px-4 py-2 hover:bg-primary-700"
                  >
                    Contact Us
                  </NavLink>
                </li>
                {!user ? (
                  <li>
                    <button
                      onClick={() => setShowRegisterForm(true)}
                      className="bg-accent-500 text-white block w-full text-left px-4 py-2 hover:bg-accent-600"
                    >
                      Register
                    </button>
                  </li>
                ) : (
                  <>
                    <li>
                      <NavLink
                        to="/dashboard"
                        className="bg-accent-500 text-white block px-4 py-2 hover:bg-accent-600"
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="text-white block w-full text-left px-4 py-2 hover:bg-primary-700"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </nav>

      {showRegisterForm && (
        <RegisterForm
          onClose={() => setShowRegisterForm(false)}
          onLoginClick={() => {
            setShowRegisterForm(false);
            setShowLoginForm(true);
          }}
        />
      )}

      {showLoginForm && (
        <LoginForm
          onClose={() => setShowLoginForm(false)}
          onRegisterClick={() => {
            setShowLoginForm(false);
            setShowRegisterForm(true);
          }}
        />
      )}
    </>
  );
};

export default Navigation;
