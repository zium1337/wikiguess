import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useLoading } from "../store/LoadingContext";
import LoadingOverlay from "./LoadingOverlay";

function Layout() {
  const { isLoading } = useLoading();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow relative">
        {isLoading && <LoadingOverlay />}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
