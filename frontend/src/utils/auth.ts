import { jwtDecode } from "jwt-decode";

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
