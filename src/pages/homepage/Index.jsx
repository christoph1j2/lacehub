import BaseLayout from "../../layout/BaseLayout";

function Index() {
  return (
    <BaseLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-5xl font-bold text-center">Welcome to LaceHub</h1>
        <p className="text-center mt-4 ">
          Your one-stop shop for all your lace needs
        </p>
        <div className="flex items-center gap-6 md:flex-row flex-col mt-8">
          <div className="flex-1">
            <img
              src="/images/shoe.jpg"
              alt="#"
              className="mt-4  mx-auto rounded-lg shadow-lg "
            />
          </div>
          <div className="flex-1 flex flex-col gap-6 items-start ">
            <h1 className="text-5xl font-bold">Shoes</h1>
            <p className="text-lg">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Placeat
              totam modi facilis, atque doloremque id accusantium. Lorem ipsum
              dolor, sit amet consectetur adipisicing elit. Asperiores, est,
              laudantium ullam sunt, dolorum at rerum placeat cum quae molestiae
              facilis expedita dolor nam? Reprehenderit ad doloremque
              praesentium. Praesentium, porro.
            </p>
            <button className="bg-secondary-500 hover:bg-[#7c51ff] shadow-md text-white px-10 py-3 rounded-full ">
              asdas
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Index;
