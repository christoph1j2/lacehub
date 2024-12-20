// components/RegisterForm.jsx
import { XMarkIcon } from "@heroicons/react/24/outline";

const RegisterForm = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <XMarkIcon className="size-6" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-8">Join LaceHub</h2>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent transition-shadow"
              placeholder="Enter your username"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent transition-shadow"
                placeholder="First name"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent transition-shadow"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent transition-shadow"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="button"
            className="w-full bg-secondary-600 text-white px-6 py-3 rounded-full hover:bg-secondary-500 transition-all duration-300 font-semibold mt-8 hover:shadow-lg"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a
              href="#"
              className="text-secondary-600 hover:text-secondary-500 font-medium"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
