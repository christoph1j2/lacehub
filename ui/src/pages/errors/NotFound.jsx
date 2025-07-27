import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-5xl font-bold text-accent-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-primary-800 mb-6">
          Page Not Found
        </h2>
        <p className="text-primary-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-secondary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary-600 transition-colors duration-300"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
