import React from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

const AdminLayout: React.FC = () => {
  return (
    <div className="app-shell admin-app-shell">
      <ScrollToTop />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
