import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  listTenants,
  createTenant,
  updateTenant,
  deleteTenant,
} from "../api/api";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = async () => {
    setError("");
    try {
      const data = await listTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load tenants");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        await updateTenant(editingId, form);
        setSuccess("Tenant updated.");
      } else {
        await createTenant(form);
        setSuccess("Tenant created.");
      }
      setForm({ name: "" });
      setEditingId(null);
      refresh();
    } catch (e) {
      setError(e.message || "Save failed");
    }
  };

  const onEdit = (t) => {
    setEditingId(t.id);
    setForm({ name: t.name || "" });
  };

  const onDelete = async (id) => {
    setError("");
    setSuccess("");
    try {
      await deleteTenant(id);
      setSuccess("Tenant deleted.");
      refresh();
    } catch (e) {
      setError(e.message || "Delete failed");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Tenants</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-3">
            {success}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="card mb-6 grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            className="form-input"
            placeholder="Tenant name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <button className="btn btn-primary">
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-gray-100">
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-warning"
                      onClick={() => onEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-gray-500 text-center py-4">
                    No tenants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
