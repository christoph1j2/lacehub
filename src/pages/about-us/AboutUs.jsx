import { useState, useEffect } from "react";

const AboutUs = () => {
  const [offset, setOffset] = useState(0);

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

  // Team members based on the actual project team
  const teamMembers = [
    {
      name: "Bui Dai Duong",
      role: "Frontend Developer",
      bio: "Responsible for UI/UX design, frontend implementation, SEO optimization, and creating user guides.",
      image: "/placeholder-profile-1.jpg"
    },
    {
      name: "Ernst Christoph Leschka",
      role: "Backend Developer",
      bio: "Responsible for backend development, database modeling, and implementing unit tests with PostgreSQL.",
      image: "/placeholder-profile-2.jpg"
    },
    {
      name: "Vojtěch Šebek",
      role: "DevOps Engineer",
      bio: "Manages server infrastructure, security implementation, monitoring, and backup systems.",
      image: "/placeholder-profile-3.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-primary-900 text-primary-100 overflow-hidden">
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
                transform: `translateY(${offset * 0.2}px) rotate(${offset * 0.01}deg)`,
              }}
            ></div>
            <div
              className="absolute w-72 h-72 bg-accent-500/30 rounded-full blur-3xl bottom-0 right-0"
              style={{
                transform: `translateY(${offset * 0.15}px) rotate(${offset * -0.01}deg)`,
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
              About LaceHub
            </h1>
            <p
              className="text-xl text-primary-300 max-w-3xl mx-auto"
              style={{
                transform: `translateY(${offset * -0.08}px)`,
              }}
            >
              Creating the ultimate platform for sneaker enthusiasts to connect, buy, and sell.
            </p>
          </div>
        </div>
      </div>

      {/* The Team Section */}
      <div className="py-20 relative z-10" id="team">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
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
                  className="bg-primary-800/50 rounded-2xl p-6 backdrop-blur-sm border border-primary-700 transform hover:-translate-y-2 transition-all duration-300 text-center"
                  style={{
                    transform: `translateY(${Math.min(offset * -0.03 * (index + 1), 15)}px)`,
                  }}
                >
                  <div className="mb-4 relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 blur-md opacity-70"></div>
                    <div className="absolute inset-0.5 rounded-full bg-primary-800"></div>
                    <div className="relative w-full h-full overflow-hidden rounded-full flex items-center justify-center text-2xl font-bold text-accent-500">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-accent-100">{member.name}</h3>
                  <p className="text-secondary-500 text-sm mb-2">{member.role}</p>
                  <p className="text-primary-300 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-lg text-primary-300 italic">
                "We built LaceHub because we couldn't find a platform that truly understood what sneakerheads need."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Project Section */}
      <div className="py-20 relative z-10 bg-primary-800/30" id="project">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div
                className="w-full md:w-1/2 order-2 md:order-1"
                style={{
                  transform: `translateY(${Math.min(offset * -0.04, 20)}px)`,
                }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-primary-800/70 border border-primary-700 rounded-2xl p-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                      <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                        The Project
                      </span>
                    </h2>
                    <p className="text-primary-200 mb-6">
                      A web app to help people track and trade their sneakers.
                    </p>
                    <p className="text-primary-300 mb-4">
                      LaceHub is a comprehensive platform designed to connect sneaker sellers and buyers through:
                    </p>
                    <ul className="text-primary-300 space-y-2">
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-accent-500">•</span>
                        Inventory management for sellers
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-accent-500">•</span>
                        Wish list creation for buyers
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-accent-500">•</span>
                        Automatic matching between listings and wishes
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-accent-500">•</span>
                        Email notifications when matches are found
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-accent-500">•</span>
                        Excel import support for bulk listings
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div
                className="w-full md:w-1/2 order-1 md:order-2"
                style={{
                  transform: `translateY(${Math.min(offset * -0.03, 15)}px)`,
                }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/10 to-secondary-500/10 rounded-3xl blur-xl"></div>
                  <div className="relative p-2 sm:p-4 bg-primary-800/30 rounded-3xl border border-primary-700">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {/* Feature boxes */}
                      {["Upload Inventory", "Create Wish Lists", "Auto-Matching", "Get Notifications"].map((feature, index) => (
                        <div 
                          key={index}
                          className="aspect-square bg-primary-900/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:bg-primary-800/80 transition-colors"
                        >
                          <div className="w-10 h-10 mb-3 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-primary-900 font-bold">{index + 1}</span>
                          </div>
                          <h3 className="text-accent-100 font-medium">{feature}</h3>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Section - FIXED PARALLAX */}
      <div className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                  Our Technology
                </span>
              </h2>
              <p className="text-xl text-primary-300 max-w-3xl mx-auto">
                Building with modern tools for speed, security, and scalability.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                  title: "Frontend",
                  tech: "React.js",
                  description: "Building a responsive, interactive user interface for an optimal experience."
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                  ),
                  title: "Backend",
                  tech: "Nest.js & PostgreSQL",
                  description: "Creating a robust API with reliable data management and storage."
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 13v10h-6v-6H9v6H3V13H0L12 1l12 12h-3z" />
                    </svg>
                  ),
                  title: "Infrastructure",
                  tech: "Linux Alpine",
                  description: "Hosting on a secure, monitored server with comprehensive backup systems."
                }
              ].map((tech, index) => (
                <div
                  key={index}
                  className="bg-primary-800/50 rounded-2xl p-6 backdrop-blur-sm border border-primary-700 text-center transform hover:-translate-y-2 transition-all duration-300"
                  // Using fixed values instead of scroll-based transformations
                >
                  <div className="inline-block p-4 rounded-full bg-primary-700/50 text-accent-500 mb-6">
                    {tech.icon}
                  </div>
                  <h3 className="text-xl font-bold text-accent-100 mb-1">{tech.title}</h3>
                  <p className="text-secondary-500 mb-3">{tech.tech}</p>
                  <p className="text-primary-300">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Future Section */}
      <div className="py-20 relative z-10 bg-primary-800/30" id="future">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                The Future
              </span>
            </h2>
            <p className="text-xl text-primary-200 mb-8">
              To become the go-to platform for sneakerheads worldwide.
            </p>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-xl"></div>
              <div
                className="relative p-8 sm:p-10 bg-primary-800/60 rounded-2xl border border-primary-700"
                style={{
                  transform: `translateY(${Math.min(offset * -0.04, 20)}px)`,
                }}
              >
                <div className="max-w-3xl mx-auto">
                  <p className="text-primary-300 mb-6">
                    We're building LaceHub for the long haul, with plans to expand our platform:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left">
                    {[
                      "Expanding user base across Europe",
                      "Adding authentication services",
                      "Creating a mobile app version",
                      "Implementing AI for better matches",
                      "Building a reputation system",
                      "Offering detailed analytics for sellers"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 mt-1 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-primary-900" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-primary-200 text-left">{feature}</p>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-accent-300 font-medium">
                    We're just getting started. Join us on this journey.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-16">
              <a
                href="#" 
                className="inline-block px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300"
              >
                Join Our Community
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="relative p-8 sm:p-12 rounded-3xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-2xl"></div>
              <div className="absolute inset-0 bg-primary-800/60 rounded-3xl backdrop-blur-sm border border-primary-700"></div>
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-accent-100">
                  Ready to join the community?
                </h2>
                <p className="text-xl text-primary-300 mb-8 max-w-2xl mx-auto">
                  Start listing your sneakers or create your wish list today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/register" 
                    className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300"
                  >
                    Get Started
                  </a>
                  <a
                    href="/contact" 
                    className="px-8 py-3 rounded-lg font-bold text-lg border-2 border-accent-100 text-accent-100 hover:bg-accent-100 hover:text-primary-900 transition-all duration-300"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
