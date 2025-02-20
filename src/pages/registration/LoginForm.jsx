import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./useAuth"; // Adjust the import path as needed

const LoginForm = ({ onClose, onRegisterClick }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://api.lacehub.cz/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Show success message
      setShowSuccess(true);

      // Update authentication state
      await login(data);

      // Close form after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrors({
        submit: error.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <XMarkIcon className="size-6" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent transition-shadow"
              placeholder="your@email.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent transition-shadow"
              placeholder="Enter your password"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-red-500 text-sm text-center">{errors.submit}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary-600 text-white px-6 py-3 rounded-full hover:bg-secondary-500 transition-all duration-300 font-semibold mt-8 hover:shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Dont have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegisterClick();
              }}
              className="text-secondary-600 hover:text-secondary-500 font-medium"
            >
              Register
            </button>
          </p>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
          Successfully logged in! Welcome back!
        </div>
      )}
    </div>
  );
};

export default LoginForm;
