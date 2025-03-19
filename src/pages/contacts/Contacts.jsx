import { useState, useEffect } from "react";

const Contacts = () => {
  const [offset, setOffset] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage("Your message has been sent. We'll get back to you soon!");
      setFormData({ name: "", email: "", message: "" });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitMessage(""), 5000);
    }, 1500);
  };

  // Developer team data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Frontend Developer",
      bio: "Crafting beautiful user experiences with React and modern CSS techniques.",
      image: "/placeholder-profile-1.jpg",
      contact: "alex@lacehub.com",
      social: {
        github: "https://github.com/alexjohnson",
        linkedin: "https://linkedin.com/in/alexjohnson",
      }
    },
    {
      name: "Sam Rivera",
      role: "Backend Developer",
      bio: "Building robust APIs and database solutions to power our platform.",
      image: "/placeholder-profile-2.jpg",
      contact: "sam@lacehub.com",
      social: {
        github: "https://github.com/samrivera",
        linkedin: "https://linkedin.com/in/samrivera",
      }
    },
    {
      name: "Jordan Lee",
      role: "DevOps Engineer",
      bio: "Managing server infrastructure and ensuring smooth deployment pipelines.",
      image: "/placeholder-profile-3.jpg",
      contact: "jordan@lacehub.com",
      social: {
        github: "https://github.com/jordanlee",
        linkedin: "https://linkedin.com/in/jordanlee",
      }
    }
  ];

  return (
    <div className="min-h-screen bg-primary-900 text-primary-100 overflow-hidden">
      {/* Header Section */}
      <div className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background elements */}
        <div
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${offset * 0.5}px)`,
          }}
        >
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900"></div>

          {/* Geometric patterns */}
          <div className="absolute inset-0 hidden sm:block opacity-10">
            <div
              className="absolute w-72 h-72 bg-secondary-500/30 rounded-full blur-3xl -top-20 -left-20"
              style={{
                transform: `translateY(${offset * 0.3}px) rotate(${offset * 0.02}deg)`,
              }}
            ></div>
            <div
              className="absolute w-72 h-72 bg-accent-500/30 rounded-full blur-3xl top-1/2 right-0"
              style={{
                transform: `translateY(${offset * 0.25}px) rotate(${offset * -0.02}deg)`,
              }}
            ></div>
          </div>
        </div>

        {/* Header Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              style={{
                transform: `translateY(${offset * -0.2}px)`,
              }}
            >
              Get in Touch
            </h1>
            <p
              className="text-xl text-primary-300 mb-8"
              style={{
                transform: `translateY(${offset * -0.15}px)`,
              }}
            >
              Have questions about LaceHub? Want to join our team? Reach out to us.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="py-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
              Meet Our Team
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-primary-800/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-primary-700 transform hover:-translate-y-2 transition-all duration-300"
                style={{
                  transform: `translateY(${offset * -0.1 * (index + 1)}px)`,
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 blur-md opacity-70"></div>
                    <div className="absolute inset-0.5 rounded-full bg-primary-800"></div>
                    <div className="relative w-full h-full overflow-hidden rounded-full">
                      {/* Using a div with background-image as a placeholder */}
                      <div 
                        className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-600"
                        style={{
                          backgroundImage: `url('https://via.placeholder.com/150?text=${member.name.charAt(0)}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-accent-100">{member.name}</h3>
                  <p className="text-secondary-500 mb-3">{member.role}</p>
                  <p className="text-primary-300 mb-4 text-sm">{member.bio}</p>
                  
                  <div className="mt-auto">
                    <p className="text-accent-300 text-sm mb-3">{member.contact}</p>
                    <div className="flex justify-center space-x-4">
                      <a 
                        href={member.social.github}
                        className="text-primary-400 hover:text-accent-500 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a 
                        href={member.social.linkedin}
                        className="text-primary-400 hover:text-accent-500 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-16 sm:py-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary-800/50 rounded-2xl p-8 sm:p-10 backdrop-blur-sm border border-primary-700">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                <span className="bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                  Send Us a Message
                </span>
              </h2>

              {submitMessage && (
                <div className="mb-6 py-3 px-4 bg-accent-500/20 text-accent-100 rounded">
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-primary-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-primary-700/50 border border-primary-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-primary-100"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-primary-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-primary-700/50 border border-primary-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-primary-100"
                  />
                </div>
                
                <div className="mb-8">
                  <label htmlFor="message" className="block text-primary-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full p-3 bg-primary-700/50 border border-primary-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-primary-100"
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-primary-900 transition-all duration-300 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Contact Info */}
      <div className="pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4 text-accent-100">
              Additional Ways to Connect
            </h3>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contact@lacehub.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Sneaker St, New York, NY</span>
              </div>
            </div>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-primary-400 hover:text-accent-500 transition-colors">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-primary-400 hover:text-accent-500 transition-colors">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-primary-400 hover:text-accent-500 transition-colors">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
