import {
  loginUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  getCurrentUser,
} from "./api";

// Mock jwt-decode
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));
import { jwtDecode } from "jwt-decode";

describe("api module", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();

    // Simple localStorage mock
    store = {};
    // Define as configurable to allow reassignment across tests in JSDOM
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: (key) => (key in store ? store[key] : null),
        setItem: (key, value) => {
          store[key] = String(value);
        },
        removeItem: (key) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k]);
        },
      },
      configurable: true,
      writable: true,
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  function mockFetchOk(data, { contentType = "application/json" } = {}) {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue(contentType),
      },
      json: async () => data,
      text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    });
  }

  function mockFetchError({
    data,
    statusText = "Bad Request",
    contentType = "application/json",
  } = {}) {
    fetch.mockResolvedValue({
      ok: false,
      statusText,
      headers: {
        get: jest.fn().mockReturnValue(contentType),
      },
      json: async () => data,
      text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    });
  }

  describe("Auth: loginUser", () => {
    it("sends POST to /auth/login with payload and returns JSON", async () => {
      const payload = { email: "a@example.com", password: "secret" };
      const response = { token: "abc" };
      mockFetchOk(response);

      const data = await loginUser(payload);

      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/auth/login");
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.body).toBe(JSON.stringify(payload));
      expect(data).toEqual(response);
    });

    it("includes Authorization header when token exists", async () => {
      localStorage.setItem("access_token", "mytoken");
      mockFetchOk({ ok: true });

      await listUsers();

      const [, options] = fetch.mock.calls[0];
      expect(options.headers["Authorization"]).toBe("Bearer mytoken");
    });

    it("omits Authorization header when token missing", async () => {
      mockFetchOk([]);

      await listUsers();

      const [, options] = fetch.mock.calls[0];
      expect(options.headers["Authorization"]).toBeUndefined();
    });
  });

  describe("Users endpoints", () => {
    it("listUsers makes GET to /users", async () => {
      const users = [{ id: 1 }];
      mockFetchOk(users);

      const data = await listUsers();

      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/users");
      expect(options.method).toBeUndefined(); // default GET
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(data).toEqual(users);
    });

    it("createUser POSTs to /users with payload", async () => {
      const payload = { name: "John" };
      const created = { id: 2, ...payload };
      mockFetchOk(created);

      const data = await createUser(payload);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/users");
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify(payload));
      expect(data).toEqual(created);
    });

    it("updateUser PUTs to /users/:id with payload", async () => {
      const payload = { name: "Jane" };
      const updated = { id: 7, ...payload };
      mockFetchOk(updated);

      const data = await updateUser(7, payload);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/users/7");
      expect(options.method).toBe("PUT");
      expect(options.body).toBe(JSON.stringify(payload));
      expect(data).toEqual(updated);
    });

    it("deleteUser DELETEs to /users/:id and returns text when non-JSON", async () => {
      mockFetchOk("OK", { contentType: "text/plain" });

      const data = await deleteUser(3);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/users/3");
      expect(options.method).toBe("DELETE");
      expect(data).toBe("OK");
    });
  });

  describe("Tenants endpoints", () => {
    it("listTenants makes GET to /tenants", async () => {
      const tenants = [{ id: 1 }];
      mockFetchOk(tenants);

      const data = await listTenants();

      const [url] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/tenants");
      expect(data).toEqual(tenants);
    });

    it("createTenant POSTs to /tenants with payload", async () => {
      const payload = { name: "Acme" };
      const created = { id: 10, ...payload };
      mockFetchOk(created);

      const data = await createTenant(payload);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/tenants");
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify(payload));
      expect(data).toEqual(created);
    });

    it("updateTenant PUTs to /tenants/:id with payload", async () => {
      const payload = { name: "Globex" };
      const updated = { id: 2, ...payload };
      mockFetchOk(updated);

      const data = await updateTenant(2, payload);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/tenants/2");
      expect(options.method).toBe("PUT");
      expect(options.body).toBe(JSON.stringify(payload));
      expect(data).toEqual(updated);
    });

    it("deleteTenant DELETEs to /tenants/:id", async () => {
      mockFetchOk({ success: true });

      const data = await deleteTenant(9);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3001/tenants/9");
      expect(options.method).toBe("DELETE");
      expect(data).toEqual({ success: true });
    });
  });

  describe("Error handling", () => {
    it("throws error using JSON error.message when not ok", async () => {
      mockFetchError({ data: { message: "Nope" } });

      await expect(listUsers()).rejects.toThrow("Nope");
    });

    it("throws error using JSON error.error when not ok", async () => {
      mockFetchError({ data: { error: "Failed" } });

      await expect(createUser({})).rejects.toThrow("Failed");
    });

    it("throws error using statusText when not ok and text/plain", async () => {
      mockFetchError({ data: "Something went wrong", contentType: "text/plain", statusText: "Bad Request" });

      await expect(updateUser(1, {})).rejects.toThrow("Bad Request");
    });
  });

  describe("getCurrentUser", () => {
    it("returns null when no token", () => {
      expect(getCurrentUser()).toBeNull();
      expect(jwtDecode).not.toHaveBeenCalled();
    });

    it("decodes and returns user when token present", () => {
      localStorage.setItem("access_token", "abc.def.ghi");
      jwtDecode.mockReturnValue({ sub: "123", email: "u@example.com" });

      const user = getCurrentUser();

      expect(jwtDecode).toHaveBeenCalledWith("abc.def.ghi");
      expect(user).toEqual({ sub: "123", email: "u@example.com" });
    });

    it("returns null and logs when token is invalid", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("access_token", "bad.token");
      jwtDecode.mockImplementation(() => {
        throw new Error("invalid token");
      });

      const user = getCurrentUser();
      expect(user).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
