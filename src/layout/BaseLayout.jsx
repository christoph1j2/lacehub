import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

function BaseLayout({ children }) {
  return (
    <div className="grid  grid-rows-[auto_1fr_auto] grid-colums-[100%] min-h-screen">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default BaseLayout;
