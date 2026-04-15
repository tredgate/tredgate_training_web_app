import { useState } from "react";
import { useDefects } from "./hooks/useDefects";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DefectList from "./pages/DefectList";
import ReportDefect from "./pages/ReportDefect";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { defects, addDefect, removeDefect, reset } = useDefects();

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-6 py-6 flex-1">
        <Navbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />

        {currentPage === "dashboard" && <Dashboard defects={defects} />}
        {currentPage === "list" && (
          <DefectList
            defects={defects}
            onResolve={removeDefect}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === "report" && (
          <ReportDefect onSubmit={addDefect} onNavigate={setCurrentPage} />
        )}

        <Footer onReset={reset} />
      </div>
    </div>
  );
}
