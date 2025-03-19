import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import RegisterForm from "../registration/RegisterForm";
import PageTransition from "../../components/PageTransition";

const AboutUs = () => {
  const [offset, setOffset] = useState(0);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/dashboard");
    } else {
      setShowRegisterForm(true);
    }
  };

  // Team members based on the actual project team
  const teamMembers = [
    {
      name: "Bui Dai Duong",
      role: "Frontend Developer",
      bio: "Responsible for UI/UX design, frontend implementation, SEO optimization, and creating user guides.",
      image: "/placeholder-profile-1.jpg",
    },
    {
      name: "Ernst Christoph Leschka",
      role: "Backend Developer",
      bio: "Responsible for robust API backend development, database modeling, and implementing unit tests.",
      image: "/placeholder-profile-2.jpg",
    },
    {
      name: "Vojtěch Šebek",
      role: "DevOps Engineer",
      bio: "Manages server infrastructure, security implementation, monitoring, and backup systems.",
      image: "/placeholder-profile-3.jpg",
    },
  ];

  return (
    <PageTransition>
    <div className="bg-primary-900 text-primary-100">
      {/* Show register form if needed */}
      {showRegisterForm && (
        <RegisterForm onClose={() => setShowRegisterForm(false)} />
      )}
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 bg-gradient-to-b from-primary-800 to-primary-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About LaceHub
            </h1>
            <p className="text-xl text-primary-300 max-w-3xl mx-auto">
              Creating the ultimate platform for sneaker enthusiasts to connect, buy, and sell.
            </p>
          </div>
        </div>
      </div>

      {/* The Team Section */}
      <div className="py-16 bg-primary-900" id="team">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                  The Team
                </span>
              </h2>
              <p className="text-xl text-primary-300 max-w-3xl mx-auto">
                A bunch of sneakerheads who love to code. For sneakerheads, by sneakerheads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-primary-800 rounded-xl p-6 border border-primary-700 hover:border-accent-500 transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-primary-700 flex items-center justify-center text-2xl font-bold text-accent-500">
                        {member.name.charAt(0)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-accent-100">{member.name}</h3>
                    <p className="text-secondary-500 mb-3">{member.role}</p>
                    <p className="text-primary-300">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg text-primary-300 italic">
                "We built LaceHub because we couldn't find a platform that truly understood what sneakerheads need."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Project Section */}
      <div className="py-16 bg-primary-800" id="project">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                The Project
              </span>
            </h2>
            <p className="text-xl text-primary-200 mb-8">
              A web app to help people track and trade their sneakers.
            </p>
            
            <div className="bg-primary-700 rounded-xl p-8 border border-primary-600 mb-12">
              <p className="text-primary-300 mb-6">
                LaceHub is a comprehensive platform designed to:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {[
                  "Allow sellers to upload their sneaker inventory and define their Want-to-Buy list",
                  "Let buyers create Want-to-Buy lists of desired sneakers",
                  "Automatically match buyers and sellers",
                  "Send notifications when matches are found",
                  "Provide user profiles with activity tracking",
                  "Support bulk imports via Excel spreadsheets"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-primary-200">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-primary-300 mb-6">
                Our solution streamlines the buying and selling process for sneaker enthusiasts 
                by automatically connecting people based on their Want-to-Buy and Want-to-Sell lists.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Technology Section */}
      <div className="py-16 bg-primary-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                Our Technology
              </span>
            </h2>
            <p className="text-xl text-primary-300 mb-8">
              Building with modern tools for speed, security, and scalability.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Frontend",
                  tech: "React.js",
                  description: "Building a responsive, interactive user interface for an optimal shopping experience."
                },
                {
                  title: "Backend",
                  tech: "Nest.js",
                  description: "Creating a robust API with PostgreSQL database for reliable data management."
                },
                {
                  title: "Infrastructure",
                  tech: "Linux Alpine",
                  description: "Hosting on a secure, monitored server with comprehensive backup systems."
                }
              ].map((stack, index) => (
                <div key={index} className="bg-primary-800 rounded-xl p-6 border border-primary-700">
                  <h3 className="text-xl font-bold text-accent-100 mb-1">{stack.title}</h3>
                  <p className="text-secondary-500 mb-3">{stack.tech}</p>
                  <p className="text-primary-300">{stack.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Future Section */}
      <div className="py-16 bg-primary-800" id="future">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                The Future
              </span>
            </h2>
            <p className="text-xl text-primary-200 mb-8">
              To become the go-to platform for sneakerheads worldwide.
            </p>
            
            <div className="bg-primary-700 rounded-xl p-8 border border-primary-600 mb-8">
              <p className="text-primary-300 mb-6">
                Our vision extends beyond the present. Here's where we're headed:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {[
                  "Expanding our user base across Europe",
                  "Chat functionality for buyers and sellers",
                  "Creating a mobile app version",
                  "Upgrading the matching algorithm",
                  "Building a reputation system",
                  "Offering detailed analytics for sellers"
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-primary-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-accent-300 font-medium">
              We're just getting started. Join us on this journey.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-b from-primary-900 to-primary-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-accent-100">
              Ready to join the community?
            </h2>
            <p className="text-lg text-primary-300 mb-8">
              Start listing your sneakers or create your wish list today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#" 
                onClick={handleGetStartedClick}
                className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300"
              >
                Get Started
              </a>
              <a
                href="/contacts" 
                className="px-8 py-3 rounded-lg font-bold text-lg border-2 border-accent-100 text-accent-100 hover:bg-accent-100 hover:text-primary-900 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default AboutUs;
