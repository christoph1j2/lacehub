import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import RegisterForm from "../registration/RegisterForm";
import PageTransition from "../../components/PageTransition";
import LoginForm from "../registration/LoginForm"; // Add this import

const HowItWork = () => {
  const [offset, setOffset] = useState(0);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false); // Add this state
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setOffset(window.pageYOffset);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAccountClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/dashboard");
    } else {
      setShowRegisterForm(true);
    }
  };

  // Steps for the platform usage
  const sellerSteps = [
    {
      title: "Create an Account",
      description:
        "Sign up to become a seller on LaceHub with your email address.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      title: "Upload Your Inventory",
      description:
        "Add your sneakers individually with SKU codes and sizes, or import all your items using our Excel template.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      title: "Manage Your Listings",
      description:
        "Update stock levels, remove sold items, or add new products to your inventory as needed.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      title: "Get Notified of Matches",
      description:
        "Receive email notifications when a buyer is looking for sneakers you have in stock.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  const buyerSteps = [
    {
      title: "Create an Account",
      description:
        "Sign up as a buyer to start looking for your favorite sneakers.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      title: "Create a Wish List",
      description:
        "Add the SKU codes and sizes of the sneakers you're looking to buy.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      title: "Bulk Upload Your Wants",
      description:
        "Import multiple items at once using our Excel template to quickly build your wish list.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      title: "Get Notified of Matches",
      description:
        "Receive email notifications when a seller has the sneakers you're looking for.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-primary-900 text-primary-100 overflow-hidden">
        {/* Show register form if needed */}
        {showRegisterForm && (
          <RegisterForm 
            onClose={() => setShowRegisterForm(false)} 
            onLoginClick={() => {
              setShowRegisterForm(false);
              setShowLoginForm(true);
            }}
          />
        )}
        
        {/* Add login form */}
        {showLoginForm && (
          <LoginForm
            onClose={() => setShowLoginForm(false)}
            onRegisterClick={() => {
              setShowLoginForm(false);
              setShowRegisterForm(true);
            }}
          />
        )}

        {/* Hero Section */}
        <div className="relative py-20 sm:py-32 overflow-hidden">
          {/* Background elements */}
          <div
            className="absolute inset-0 z-0"
            style={{
              transform: `translateY(${offset * 0.3}px)`,
            }}
          >
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900"></div>

            {/* Geometric patterns */}
            <div className="absolute inset-0 hidden sm:block opacity-10">
              <div
                className="absolute w-72 h-72 bg-secondary-500/30 rounded-full blur-3xl -top-20 -left-20"
                style={{
                  transform: `translateY(${offset * 0.2}px) rotate(${
                    offset * 0.01
                  }deg)`,
                }}
              ></div>
              <div
                className="absolute w-72 h-72 bg-accent-500/30 rounded-full blur-3xl bottom-0 right-0"
                style={{
                  transform: `translateY(${offset * 0.15}px) rotate(${
                    offset * -0.01
                  }deg)`,
                }}
              ></div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                style={{
                  transform: `translateY(${offset * -0.1}px)`,
                }}
              >
                How It Works
              </h1>
              <p
                className="text-xl text-primary-300 max-w-3xl mx-auto"
                style={{
                  transform: `translateY(${offset * -0.08}px)`,
                }}
              >
                LaceHub connects sneaker sellers and buyers through our
                automated matching system. Here is how to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="py-16 relative z-10 bg-primary-800/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div
                  className="w-full md:w-1/2"
                  style={{
                    transform: `translateY(${Math.min(offset * -0.04, 20)}px)`,
                  }}
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-xl"></div>
                    <div className="relative bg-primary-800/70 border border-primary-700 rounded-2xl p-8">
                      <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                          The Platform
                        </span>
                      </h2>
                      <p className="text-primary-300 mb-6">
                        LaceHub is designed to streamline the process of buying
                        and selling sneakers:
                      </p>
                      <ul className="text-primary-300 space-y-4">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              1
                            </span>
                          </span>
                          <div>
                            <span className="font-medium text-accent-100">
                              Sellers list inventory
                            </span>
                            <p className="mt-1">
                              Upload your sneaker collection with SKU codes and
                              sizes.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              2
                            </span>
                          </span>
                          <div>
                            <span className="font-medium text-accent-100">
                              Buyers create wish lists
                            </span>
                            <p className="mt-1">
                              Specify the sneakers you are looking to purchase.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              3
                            </span>
                          </span>
                          <div>
                            <span className="font-medium text-accent-100">
                              Automatic matching
                            </span>
                            <p className="mt-1">
                              Our system identifies when a seller has what a
                              buyer wants.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              4
                            </span>
                          </span>
                          <div>
                            <span className="font-medium text-accent-100">
                              Email notifications
                            </span>
                            <p className="mt-1">
                              Both parties are notified when a match is found.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div
                  className="w-full md:w-1/2 order-first md:order-last"
                  style={{
                    transform: `translateY(${Math.min(offset * -0.0, 15)}px)`,
                  }}
                >
                  <div className="relative aspect-video max-w-lg mx-auto">
                    <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/10 to-secondary-500/10 rounded-3xl blur-xl"></div>
                    <div className="relative h-full w-full bg-primary-800/50 rounded-2xl overflow-hidden border border-primary-700">
                      {/* Replace with actual video or animated illustration */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="mb-4 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-primary-900"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <p className="text-primary-300">
                            Watch our overview video
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Sellers Section */}
        <div className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                    For Sellers
                  </span>
                </h2>
                <p className="text-xl text-primary-300 max-w-3xl mx-auto">
                  List your inventory and connect with interested buyers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                {sellerSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-primary-800/50 rounded-2xl p-6 backdrop-blur-sm border border-primary-700 transform hover:-translate-y-2 transition-all duration-300 text-center h-full"
                    style={{
                      transform: `translateY(${Math.min(
                        offset * -0.01 * (index + 0.5),
                        10
                      )}px)`,
                    }}
                  >
                    <div className="mb-4 relative mx-auto w-16 h-16">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 blur-md opacity-70"></div>
                      <div className="absolute inset-0 rounded-full bg-primary-800 flex items-center justify-center">
                        <div className="relative text-accent-500">
                          {step.icon}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-accent-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-primary-300 text-sm">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <div className="inline-block p-4 rounded-xl bg-primary-800/70 border border-primary-700">
                  <p className="text-accent-300 mb-2">
                    Ready to start selling?
                  </p>
                  <a
                    href="#"
                    onClick={handleAccountClick}
                    className="inline-block px-6 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300"
                  >
                    Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Buyers Section */}
        <div className="py-20 relative z-10 bg-primary-800/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                    For Buyers
                  </span>
                </h2>
                <p className="text-xl text-primary-300 max-w-3xl mx-auto">
                  Find the sneakers you have been searching for with ease.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                {buyerSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-primary-800/50 rounded-2xl p-6 backdrop-blur-sm border border-primary-700 transform hover:-translate-y-2 transition-all duration-300 text-center h-full"
                    style={{
                      transform: `translateY(${Math.min(
                        offset * -0.01 * (index + 0.5),
                        10
                      )}px)`,
                    }}
                  >
                    <div className="mb-4 relative mx-auto w-16 h-16">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 blur-md opacity-70"></div>
                      <div className="absolute inset-0 rounded-full bg-primary-800 flex items-center justify-center">
                        <div className="relative text-accent-500">
                          {step.icon}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-accent-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-primary-300 text-sm">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <div className="inline-block p-4 rounded-xl bg-primary-800/70 border border-primary-700">
                  <p className="text-accent-300 mb-2">
                    Looking for specific sneakers?
                  </p>
                  <a
                    href="#"
                    onClick={handleAccountClick}
                    className="inline-block px-6 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300"
                  >
                    Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Excel Import Guide */}
        <div className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                    Bulk Import Guide
                  </span>
                </h2>
                <p className="text-xl text-primary-300 max-w-3xl mx-auto">
                  Save time by importing multiple sneakers at once using our
                  Excel template.
                </p>
              </div>

              <div
                className="relative"
                style={{
                  transform: `translateY(${Math.min(offset * 0.0, 15)}px)`,
                }}
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-primary-800/70 border border-primary-700 rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3">
                      <div className="bg-primary-900/70 rounded-xl p-4 border border-primary-700 text-center">
                        <div className="text-5xl text-accent-500 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20 mx-auto"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                          </svg>
                        </div>
                        <p className="text-primary-300 text-sm mb-3">
                          Download our template
                        </p>
                        <a
                          href="#"
                          className="inline-block px-4 py-2 rounded-lg text-xs font-bold bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-all duration-300"
                        >
                          Download Excel Template
                        </a>
                      </div>
                    </div>

                    <div className="w-full md:w-2/3">
                      <h3 className="text-xl font-bold text-accent-100 mb-4">
                        How to use the template:
                      </h3>
                      <ol className="text-primary-300 space-y-3">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              1
                            </span>
                          </span>
                          <p>
                            Download the Excel template using the button on the
                            left.
                          </p>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              2
                            </span>
                          </span>
                          <p>
                            Fill in the SKU codes, sizes, and prices (if
                            selling) of your sneakers.
                          </p>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              3
                            </span>
                          </span>
                          <p>
                            Save the file without changing its format or
                            structure.
                          </p>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center mr-3 mt-1">
                            <span className="text-primary-900 font-bold text-xs">
                              4
                            </span>
                          </span>
                          <p>
                            Upload the file in your dashboard under "Import
                            Inventory" or "Import Want To Buy list".
                          </p>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 relative z-10 bg-primary-800/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                    Frequently Asked Questions
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "Is LaceHub completely free to use?",
                    answer:
                      "Yes, LaceHub is currently free for both buyers and sellers. We may introduce premium features in the future, but our core matching service will always remain free.",
                  },
                  {
                    question: "How does the matching system work?",
                    answer:
                      "Our algorithm automatically compares SKU codes and sizes between seller inventories and buyer wish lists. When an exact match is found, we send email notifications to both parties.",
                  },
                  {
                    question: "Can I use LaceHub if I'm outside the EU?",
                    answer:
                      "Currently, LaceHub is focused on European markets, but it is possible to use the platform globally, although it's not recommended.",
                  },
                  {
                    question: "How do I update my inventory after a sale?",
                    answer:
                      "You can easily update your inventory in your seller dashboard by either removing sold items or updating quantities if you have multiple pairs of the same model and size.",
                  },
                  {
                    question: "Does LaceHub handle the payment process?",
                    answer:
                      "Currently, LaceHub only facilitates the matching process. After a match is found, buyers and sellers connect directly to arrange payment and delivery details.",
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="bg-primary-800/50 rounded-xl p-6 backdrop-blur-sm border border-primary-700"
                  >
                    <h3 className="text-lg font-bold text-accent-100 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-primary-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16 relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative p-8 sm:p-12 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-0 bg-primary-800/60 rounded-3xl backdrop-blur-sm border border-primary-700"></div>
                <div className="relative">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-accent-100">
                    Ready to Get Started?
                  </h2>
                  <p className="text-xl text-primary-300 mb-8 max-w-2xl mx-auto">
                    Join LaceHub today and connect with sneaker enthusiasts
                    across Europe.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="#"
                      onClick={handleAccountClick}
                      className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300"
                    >
                      Create Account
                    </a>
                    <a
                      href="/contacts"
                      className="px-8 py-3 rounded-lg font-bold text-lg border-2 border-accent-100 text-accent-100 hover:bg-accent-100 hover:text-primary-900 transition-all duration-300"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HowItWork;
