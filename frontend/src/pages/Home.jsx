import React from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-700">
          Welcome to your multi-tenant SaaS Starter Kit.
        </p>
        <ul className="list-disc pl-6 mt-4 text-gray-700">
          <li>Use the top nav to manage Users and Tenants.</li>
          <li>All API calls include your JWT token automatically.</li>
          <li>
            UI fully connected to the database-backed endpoints for full CRUD.
          </li>
        </ul>
      </div>
    </div>
  );
}
