import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Outlet } from "react-router";
// import HowItWork from "../pages/homepage/HowItWork";

function BaseLayout() {
  return (
    //? Background = bg-gray-800
    <div className="min-h-screen bg-gray-800 bg-fixed bg-no-repeat bg-cover">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default BaseLayout;
