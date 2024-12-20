import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
// import HowItWork from "../pages/homepage/HowItWork";

function BaseLayout({ children }) {
  return (
    <div className="min-h-screen bg-[url('/images/backgroung1.webp')] bg-fixed bg-no-repeat bg-cover">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default BaseLayout;
