import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow">
      <div className="flex justify-between items-center">
        {/* Left - Logo / Tenant name */}
        <div className="font-bold text-2xl tracking-wide">
          {user?.tenant?.name || "SaaS Starter Kit"}
        </div>

        {/* Center - Nav links */}
        <div className="flex space-x-6 absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {user?.role.includes("ADMIN") ? (
            <Link to="/users" className="hover:underline">
              Users
            </Link>
          ) : (
            ""
          )}
          {user?.role === "SUPER_ADMIN" ? (
            <Link to="/tenants" className="hover:underline">
              Tenants
            </Link>
          ) : (
            ""
          )}
        </div>

        {/* Right - Welcome + Logout */}
        <div className="flex items-center space-x-4">
          {user ? (
            <span className="italic">Welcome - {user.name}</span>
          ) : (
            <span className="text-yellow-300">Please login</span>
          )}
          <button
            onClick={logout}
            className="btn btn- secondary"
            title="Logout"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h-6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6" />
              <path d="M10 12h10" />
              <path d="M18 8l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
