import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import RegisterForm from "../pages/registration/RegisterForm";
import LoginForm from "../pages/registration/LoginForm";
import { NavLink, useLocation } from "react-router";

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
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

  // Fixed logout handler to prevent passing event to React child
  const handleLogout = () => {
    logout();
  };

  //! tady vsude, kde byla zelena, tak >>>zmena barvy<<<
  const navClass =
    location.pathname !== "/"
      ? "bg-orange-700"
      : isScrolled
      ? "bg-orange-700"
      : "bg-transparent hover:bg-orange-700";

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
                  //!tady
                  className="text-white px-4 py-2 rounded-full transition-all hover:bg-orange-800"
                >
                  How does it work?
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about-us"
                  //!tady
                  className="text-white px-4 py-2 rounded-full transition-all hover:bg-orange-800"
                >
                  About us
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contacts"
                  //!tady
                  className="text-white px-4 py-2 rounded-full transition-all hover:bg-orange-800"
                >
                  Contact us
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
                  {isAdmin() && (
                    <li>
                      <NavLink
                        to="/admin"
                        className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300"
                      >
                        Admin
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      //!tady
                      className="text-white px-4 py-2 rounded-full transition-all hover:bg-orange-800"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>

            {/* Mobile menu */}
            {isOpen && (
              //!tady
              <ul className="md:hidden absolute top-16 left-0 right-0 py-4 bg-orange-700 space-y-4 shadow-lg">
                <li>
                  <NavLink
                    to="/how-it-works"
                    //!tady
                    className="text-white block px-4 py-2 hover:bg-orange-800"
                  >
                    How Does It Work?
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about-us"
                    //!tady
                    className="text-white block px-4 py-2 hover:bg-orange-800"
                  >
                    About Us
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contacts"
                    //!tady
                    className="text-white block px-4 py-2 hover:bg-orange-800"
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
                    {isAdmin() && (
                      <li>
                        <NavLink
                          to="/admin"
                          className="bg-red-500 text-white block px-4 py-2 hover:bg-red-600"
                        >
                          Admin
                        </NavLink>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={handleLogout}
                        //!tady
                        className="text-white block w-full text-left px-4 py-2 hover:bg-orange-800"
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
