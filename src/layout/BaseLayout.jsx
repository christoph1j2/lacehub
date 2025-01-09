import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Outlet } from "react-router";
// import HowItWork from "../pages/homepage/HowItWork";

function BaseLayout() {
  return (
    <div className="min-h-screen bg-[url('/images/backgroung1.webp')] bg-fixed bg-no-repeat bg-cover">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default BaseLayout;
