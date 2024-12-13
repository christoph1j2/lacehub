import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-transparent py-4   transition duration-300 group  md:hover:bg-white">
      <div className="flex justify-between items-center container">
        <div className="text-white md:group-hover:text-black font-bold text-2xl duration-300">
          LaceHub
        </div>
        {/* Mobile menu button */}
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
        <ul className="hidden md:flex space-x-6 ">
          <li>
            <a
              href="#"
              className="text-white group-hover:text-black px-4 py-2 rounded-full transition-all hover:bg-black/5"
            >
              How Does It Work?
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-white group-hover:text-black px-4 py-2 rounded-full transition-all hover:bg-black/5"
            >
              About Us
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-white group-hover:text-black px-4 py-2 rounded-full transition-all hover:bg-black/5"
            >
              Contact Us
            </a>
          </li>
          <li>
            <a
              href="#"
              className="bg-white text-blak  px-4 py-2 rounded-full group-hover:bg-black group-hover:text-white hover:bg-primary-500 hover:text-white transition duration-300"
            >
              Register
            </a>
          </li>
        </ul>

        {/* Mobile menu */}
        {isOpen && (
          <ul className="md:hidden absolute top-16 left-0 right-0 py-4 bg-gradient-to-bl from-primary-200 to to-black space-y-4 shadow-lg container ">
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
            <li>
              <a
                href="#"
                className="bg-secondary-600 text-white px-4 py-2 rounded-full hover:bg-[#7c51ff] hover:text-white transition duration-300 inline-block"
              >
                Register
              </a>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
