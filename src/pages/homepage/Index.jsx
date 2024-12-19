import BaseLayout from "../../layout/BaseLayout";
import HowItWork from "./HowItWork";

function Index() {
  return (
    <BaseLayout>
      <section className="min-h-screen ">
        <div className="container mx-auto  h-screen">
          <div className="flex flex-col gap-6 items-center justify-center max-w-xl mx-auto aspect-square bg-gray-500/20 rounded-full p-16 drop-shadow-xl shadow-[0_0_30px_rgba(107,114,128,0.3)] relative">
            {/* Optional outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gray-400/15 blur-xl -z-10"></div>

            {/* Content wrapper with max height to prevent overflow */}
            <div className="flex flex-col items-center gap-10 max-h-screen ">
              <h1 className="text-5xl font-bold text-white text-center">
                World of Sneakers
              </h1>
              <p className="text-lg text-white text-center">
                Whether you are looking to buy, sell, or organize your shoe
                collection, we have got you covered. Create a personal inventory
                of your shoes, never forget what you own, and connect with
                others to find your next perfect pair.
              </p>
              <div className="flex gap-4">
                <button className="bg-secondary-600 hover:bg-secondary-500 shadow-md text-white px-10 py-3 rounded-full transition duration-300 font-semibold text-lg">
                  Try it yourself
                </button>
                <button className="border-2 border-secondary-600 hover:bg-secondary-500 shadow-md text-white px-10 py-3 rounded-full transition duration-300 font-semibold text-lg">
                  Learn more
                </button>
              </div>
            </div>
          </div>
          {/* <div className="flex-1">
            <img
              src="/images/zelena-bota.png"
              alt="#"
              className="mt-4  mx-auto rounded-lg shadow-lg max-w-md"
            />
          </div> */}
        </div>
      </section>
      <section className="min-h-screen">
        <HowItWork />
      </section>
    </BaseLayout>
  );
}

export default Index;
