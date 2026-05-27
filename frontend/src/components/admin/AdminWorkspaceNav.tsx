import React from "react";
import { NavLink } from "react-router-dom";

const AdminWorkspaceNav: React.FC = () => {
  return (
    <nav className="admin-nav">
      <NavLink to="/admin/dashboard">Dashboard</NavLink>
      <NavLink to="/admin/inventory">Inventory & products</NavLink>
      <NavLink to="/admin/orders">Orders & users</NavLink>
      <NavLink to="/admin/categories">Categories</NavLink>
      <NavLink to="/admin/banners">Banners</NavLink>
      <NavLink to="/admin/bulk-inquiries">Bulk inquiries</NavLink>
    </nav>
  );
};

export default AdminWorkspaceNav;
