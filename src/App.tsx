import { Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Breadcrumbs from "./components/layout/Breadcrumbs";
import Footer from "./components/layout/Footer";
import Toast from "./components/feedback/Toast";

export default function App() {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
            <Breadcrumbs />
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
      <Toast />
    </>
  );
}
