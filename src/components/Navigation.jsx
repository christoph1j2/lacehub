import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../pages/registration/useAuth"; // Adjusted the path
import RegisterForm from "../pages/registration/RegisterForm"; // Updated path
import LoginForm from "../pages/registration/LoginForm"; // Updated path
import { NavLink } from "react-router";

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="bg-transparent py-4 transition duration-300 group md:hover:bg-white">
        <div className="flex justify-between items-center container">
          <div className="text-white md:group-hover:text-black font-bold text-2xl duration-300">
            LaceHub
          </div>

          <button
            className="md:hidden text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <XMarkIcon className="size-8" />
            ) : (
              <Bars3Icon className="size-8" />
            )}
          </button>

          {/* Desktop menu */}
          <ul className="hidden md:flex space-x-6">
            <li className="m-auto">
              <a
                href="#"
                className="text-white group-hover:text-black px-4 py-2 rounded-full transition-all hover:bg-black/5"
              >
                How Does It Work?
              </a>
            </li>
            <li className="m-auto">
              <a
                href="#"
                className="text-white group-hover:text-black px-4 py-2 rounded-full transition-all hover:bg-black/5"
              >
                About Us
              </a>
            </li>
            <li className="m-auto">
              <NavLink
                to="/contacts"
                className="text-white group-hover:text-black px-4 py-2 rounded-full transition-all hover:bg-black/5"
              >
                Contact Us
              </NavLink>
            </li>
            {!user ? (
              <li>
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="bg-white text-black px-4 py-2 rounded-full group-hover:bg-black group-hover:text-white hover:bg-primary-500 hover:text-white transition duration-300"
                >
                  Register
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={logout}
                  className="bg-white text-black px-4 py-2 rounded-full group-hover:bg-black group-hover:text-white hover:bg-primary-500 hover:text-white transition duration-300"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>

          {/* Mobile menu */}
          {isOpen && (
            <ul className="md:hidden absolute top-16 left-0 right-0 py-4 bg-gradient-to-bl from-primary-200 to to-black space-y-4 shadow-lg container">
              <li>
                <a href="#" className="hover:text-primary-600 text-white block">
                  How Does It Work?
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600 text-white block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#64C381] text-white block">
                  Contact Us
                </a>
              </li>
              {!user ? (
                <li>
                  <button
                    onClick={() => setShowRegisterForm(true)}
                    className="bg-secondary-600 text-white px-4 py-2 rounded-full hover:bg-[#7c51ff] hover:text-white transition duration-300 inline-block"
                  >
                    Register
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={logout}
                    className="bg-secondary-600 text-white px-4 py-2 rounded-full hover:bg-[#7c51ff] hover:text-white transition duration-300 inline-block"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          )}
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
