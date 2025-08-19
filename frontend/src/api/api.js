import { jwtDecode } from "jwt-decode";
const API_BASE = "http://localhost:3001";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (data && data.error) || (data && data.message) || res.statusText;
    throw new Error(message);
  }
  return data;
}

// Auth
export async function loginUser({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Users
export async function listUsers() {
  // alert( JSON.stringify(jwtDecode(getToken())));
  return request("/users");
}

export async function createUser(payload) {
  // alert(`Creating user with payload: ${JSON.stringify(payload)}`);
  return request("/users", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateUser(id, payload) {
  // alert(`Updating user ${id} with payload: ${JSON.stringify(payload)}`);
  return request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

// Tenants
export async function listTenants() {
  return request("/tenants");
}
export async function createTenant(payload) {
  return request("/tenants", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateTenant(id, payload) {
  return request(`/tenants/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
export async function deleteTenant(id) {
  return request(`/tenants/${id}`, { method: "DELETE" });
}

export function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}
