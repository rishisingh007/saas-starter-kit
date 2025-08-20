import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listTenants,
} from "../api/api";
import { getCurrentUser } from "../utils/auth";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tenants, setTenants] = useState([]);
  let user = getCurrentUser();

  const refresh = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = await listUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load users");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const data = await listTenants();
        setTenants(data);
      } catch (err) {
        console.error("Failed to fetch tenants", err);
      }
    }
    fetchTenants();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        await updateUser(editingId, form);
        setSuccess("User updated.");
      } else {
        await createUser(form);
        setSuccess("User created.");
      }
      setForm({ name: "", email: "", role: "user" });
      setEditingId(null);
      refresh();
    } catch (e) {
      setError(e.message || "Save failed");
    }
  };

  const onEdit = (u) => {
    setEditingId(u.id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "user",
      tenant: u.tenant || "",
    });
  };

  const onDelete = async (id) => {
    setError("");
    setSuccess("");
    try {
      await deleteUser(id);
      setSuccess("User deleted.");
      refresh();
    } catch (e) {
      setError(e.message || "Delete failed");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Users</h1>

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
          className="card mb-6 grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          <input
            className="form-input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="form-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select
            className="form-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {user?.role !== "SUPER_ADMIN" ? (
              <option value="USER">USER</option>
            ) : (
              ""
            )}
            <option value="TENANT_ADMIN">TENANT_ADMIN</option>
            {user?.role === "SUPER_ADMIN" ? (
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            ) : (
              ""
            )}
          </select>
          {/* Show tenant selector only if role === TENANT_ADMIN */}
          {user.role === "SUPER_ADMIN" && (
            <select
              className="form-input"
              value={form.tenant?.id || ""}
              onChange={(e) =>
                setForm({ ...form, tenant: { id: e.target.value } })
              }
            >
              <option value="">-- Select Tenant --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <button className="btn btn-primary">
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-gray-100">
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role || "user"}</td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-warning"
                      onClick={() => onEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-gray-500 text-center py-4">
                    No users yet.
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
