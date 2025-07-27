import { useEffect, useState } from "react";
import HowItWork from "./HowItWork";
import AboutUs from "./AboutUS";
import PageTransition from "../../components/PageTransition";

function Index() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden parallax-container ">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
          {/* Parallax Background Layers */}
          <div
            className="absolute inset-0 z-0"
            style={{
              transform: `translateY(${offset * 0.5}px)`,
            }}
          >
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900"></div>

            {/* Geometric patterns - Hide on mobile for better performance */}
            <div
              className="absolute inset-0 hidden sm:block"
              style={{
                transform: `translateY(${offset * 0.2}px)`,
                opacity: 0.1,
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(30deg,transparent_40%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.1)_60%,transparent_60%)]"></div>

              {/* Responsive geometric elements */}
              <div
                className="absolute w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-secondary-500/10 rounded-full blur-3xl -top-20 -left-20"
                style={{
                  transform: `translateY(${offset * 0.3}px) rotate(${
                    offset * 0.02
                  }deg)`,
                }}
              ></div>

              <div
                className="absolute w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-accent-500/10 rounded-full blur-3xl top-1/2 right-0"
                style={{
                  transform: `translateY(${offset * 0.25}px) rotate(${
                    offset * -0.02
                  }deg)`,
                }}
              ></div>

              {/* Floating dots - Reduce count on mobile */}
              <div className="absolute inset-0">
                {[...Array(window.innerWidth > 768 ? 20 : 10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 sm:w-2 h-1 sm:h-2 bg-accent-100/10 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      transform: `translateY(${
                        offset * (0.1 + Math.random() * 0.2)
                      }px)`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
                {/* Text Content */}
                <div
                  className="w-full lg:w-1/2 space-y-4 sm:space-y-6 md:space-y-8 text-center lg:text-left"
                  style={{
                    transform: `translateY(${offset * -0.2}px)`,
                  }}
                >
                  <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-bold text-accent-100 tracking-tighter leading-none">
                    LaceHub
                    <span className="block text-3xl sm:text-4xl md:text-5xl xl:text-6xl mt-2 sm:mt-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-transparent bg-clip-text">
                      Curate Your Kicks
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-primary-300 max-w-2xl mx-auto lg:mx-0">
                    Your personal inventory for the world&apos;s most
                    sought-after sneakers. Track, match, and trade with the
                    community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 justify-center lg:justify-start">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-accent-100 text-primary-900 font-bold text-base sm:text-lg hover:bg-primary-100 transition-all duration-300">
                      Start Collection
                    </button>

                    <button
                      onClick={() => {
                        document
                          .getElementById("how-it-works")
                          .scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-accent-100 text-accent-100 font-bold text-base sm:text-lg hover:bg-accent-100 hover:text-primary-900 transition-all duration-300"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Featured Sneaker */}
                <div
                  className="w-full max-w-md lg:w-1/2 mt-8 lg:mt-0"
                  style={{
                    transform: `translateY(${offset * -0.1}px)`,
                  }}
                >
                  <div className="relative px-4 sm:px-0">
                    <div className="absolute -inset-4 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-3xl blur-xl"></div>
                    <img
                      src="public/images/hp-image.webp"
                      alt="Featured sneaker"
                      className="relative w-full h-auto rounded-3xl transform -rotate-12 hover:rotate-0 transition-all duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About us */}
        <AboutUs />

        {/* How It Works */}
        <div id="how-it-works">
          <HowItWork />
        </div>
      </div>
    </PageTransition>
  );
}

export default Index;
