// src/components/HowItWork.jsx
import { useState, useEffect } from 'react';
import { useInView } from '../../hooks/useInView'; // Adjust the path according to your project structure

const HowItWork = () => {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (sectionInView) {
      setAnimationStarted(true);
    }
  }, [sectionInView]);

  const steps = [
    {
      number: 1,
      title: "Join The Community",
      description:
        "Start by creating your account. Then discover your personal dashboard with the collections you own, are in need of, or want to sell. ",
      image: "/images/wireframe.webp",
      isReversed: false,
    },
    {
      number: 2,
      title: "Track & Manage",
      description:
        "Keep track of your inventory. Add sneakers to your personal super private inventory, or add sneakers to your public Want-To-Buy / Want-To-Sell lists.",
      image: "/images/wireframe.webp",
      isReversed: true,
    },
    {
      number: 3,
      title: "Match & Trade",
      description:
        "If you have your desired collection in place. Start matching your inventory with other users and trade your sneakers.",
      image: "/images/wireframe.webp",
      isReversed: false,
    },
  ];

  // Animation timing
  const baseDelay = 0;
  const headerDelay = baseDelay;
  const stepDelay = (index) => baseDelay + 600 + (index * 300);

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-24 bg-gradient-to-b from-black to-gray-900" 
      id="how-it-works"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with animation */}
        <div 
          className={`text-center mb-12 md:mb-20 transform transition-all duration-1000 ease-out
            ${animationStarted ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}
          `}
          style={{ transitionDelay: `${headerDelay}ms` }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">How It Works</h2>
          <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto px-4">
            Get started with LaceHub in three simple steps
          </p>
        </div>

        <div className="space-y-16 md:space-y-32">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                step.isReversed ? "md:flex-row-reverse" : "md:flex-row"
              } items-center gap-8 md:gap-16`}
            >
              {/* Text Content with Animation */}
              <div 
                className={`flex-1 space-y-4 md:space-y-6 transform transition-all duration-1000 ease-out px-4 md:px-0
                  ${animationStarted ? 
                    `translate-x-0 opacity-100` : 
                    `${step.isReversed ? "translate-x-20" : "-translate-x-20"} opacity-0`
                  }
                `}
                style={{ transitionDelay: `${stepDelay(index)}ms` }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span 
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 
                      text-white flex items-center justify-center text-lg md:text-xl font-bold transform transition-all duration-700
                      ${animationStarted ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                    `}
                    style={{ transitionDelay: `${stepDelay(index) + 200}ms` }}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                  {step.description}
                </p>
                <button 
                  className={`inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 
                    transition-all duration-700 transform text-sm md:text-base
                    ${animationStarted ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
                  `}
                  style={{ transitionDelay: `${stepDelay(index) + 400}ms` }}
                >
                  Learn more
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Image with Animation */}
              <div 
                className={`flex-1 transform transition-all duration-1000 ease-out w-full md:w-auto px-4 md:px-0
                  ${animationStarted ? 
                    `translate-x-0 opacity-100` : 
                    `${step.isReversed ? "-translate-x-20" : "translate-x-20"} opacity-0`
                  }
                `}
                style={{ transitionDelay: `${stepDelay(index) + 200}ms` }}
              >
                <div className="relative group">
                  <div 
                    className={`absolute -inset-2 md:-inset-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 
                      rounded-2xl md:rounded-3xl blur-lg md:blur-xl transition-all duration-700
                      ${animationStarted ? "opacity-75" : "opacity-0"}
                    `}
                    style={{ transitionDelay: `${stepDelay(index) + 400}ms` }}
                  ></div>
                  <div className="relative bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className={`w-full h-full object-cover aspect-video transform transition-all duration-700
                        ${animationStarted ? "scale-100" : "scale-95"}
                      `}
                      style={{ transitionDelay: `${stepDelay(index) + 600}ms` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWork;
