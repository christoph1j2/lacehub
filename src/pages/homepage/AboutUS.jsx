import { useEffect, useState, useRef } from "react";

const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isInView];
};

const AboutUs = () => {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.2 });
  const [animationStarted, setAnimationStarted] = useState(false);

  // Start the sequence when section comes into view
  useEffect(() => {
    if (sectionInView) {
      setAnimationStarted(true);
    }
  }, [sectionInView]);

  const features = [
    {
      title: "The Team",
      description: "A bunch of sneakerheads who love to code. For sneakerheads, by sneakerheads.",
      image: "/images/wireframe.webp"
    },
    {
      title: "The Project",
      description: "A web app to help people track and trade their sneakers.",
      image: "/images/wireframe.webp"
    },
    {
      title: "The Future",
      description: "To become the go-to platform for sneakerheads worldwide.",
      image: "/images/wireframe.webp"
    }
  ];

  // Animation sequence timing
  const baseDelay = 0; // Base delay before animations start
  const titleDelay = baseDelay;
  const itemDelay = (index) => baseDelay + 600 + (index * 300); // 400ms between each item

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-white py-16 sm:py-20 md:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title with initial animation */}
          <div className="overflow-hidden mb-8 sm:mb-12 md:mb-16">
            <h2 
              className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight transform transition-all duration-1000 ease-out
                ${animationStarted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
              `}
              style={{
                transitionDelay: `${titleDelay}ms`
              }}
            >
              About LaceHub
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="overflow-hidden"
              >
                <div 
                  className={`transform transition-all duration-1000 ease-out
                    ${animationStarted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
                  `}
                  style={{
                    transitionDelay: `${itemDelay(index)}ms`
                  }}
                >
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-900 to-black">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div 
                      className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 md:p-8 flex flex-col justify-end transform transition-all duration-700 delay-100
                        ${animationStarted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
                      `}
                      style={{
                        transitionDelay: `${itemDelay(index) + 200}ms`
                      }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
