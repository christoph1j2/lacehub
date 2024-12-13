const HowItWork = () => {
  return (
    <>
      <section className="py-20 " id="how-it-works">
        <div className="container">
          <h2 className="text-5xl font-bold text-center mb-16 text-black">
            How Does It Work?
          </h2>

          {/* Step 1 - Text Left, Image Right */}
          <div className="flex flex-col md:flex-row items-center mb-20 gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="text-2xl font-semibold">Step One</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam
                dignissimos quaerat, sed hic veniam commodi tempore qui deleniti
                doloremque expedita numquam autem quod, culpa cupiditate
                voluptatibus aperiam possimus aut obcaecati.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-200 w-full max-w-md aspect-video rounded-lg flex items-center justify-center">
                <img src="/images/shoe.png" alt="" />
              </div>
            </div>
          </div>

          {/* Step 2 - Image Left, Text Right */}
          <div className="flex flex-col md:flex-row-reverse items-center mb-20 gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="text-2xl font-semibold">Step Two</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Lorem amet consectetur adipisicing elit. Vero iste sequi,
                quisquam adipisci eligendi perspiciatis quaerat expedita id in,
                dolorum cupiditate praesentium. Iusto quaerat illo error sint!
                Modi, quod quidem.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-200 w-full max-w-md aspect-video rounded-lg flex items-center justify-center"></div>
            </div>
          </div>

          {/* Step 3 - Text Left, Image Right */}
          <div className="flex flex-col md:flex-row items-center mb-20 gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="text-2xl font-semibold">Step Three </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis
                laborum quibusdam omnis similique id, repudiandae vel animi,
                sequi accusantium minima repellendus maxime, eaque ipsum dolores
                necessitatibus illum molestias vero impedit?
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-200 w-full max-w-md aspect-video rounded-lg flex items-center justify-center"></div>
            </div>
          </div>

          {/* Step 4 - Image Left, Text Right
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  4
                </span>
                <h3 className="text-2xl font-semibold">Step Four Title</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Your step four description goes here. Explain the fourth step of
                how your service works. Add enough detail to make it clear and
                compelling.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-200 w-full max-w-md aspect-video rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Image Placeholder</span>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default HowItWork;
