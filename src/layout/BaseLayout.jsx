import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
// import HowItWork from "../pages/homepage/HowItWork";

function BaseLayout({ children }) {
  return (
    <div className="grid  grid-rows-[auto_1fr_auto] grid-colums-[100%] min-h-screen">
      {/* <div className="bg-gradient-to-b from-primary-200 to-secondary-200"> */}
      <div className="bg-[url('/images/backgroung1.webp')] bg-fixed bg-no-repeat bg-cover ">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
    // </div>
  );
}

export default BaseLayout;
