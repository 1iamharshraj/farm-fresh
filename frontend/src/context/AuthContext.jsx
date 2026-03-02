import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("farmfresh_token");
      if (token) {
        try {
          const { data } = await API.get("/auth/me");
          setUser(data.data);
        } catch {
          localStorage.removeItem("farmfresh_token");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("farmfresh_token", data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (formData) => {
    const { data } = await API.post("/auth/register", formData);
    localStorage.setItem("farmfresh_token", data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("farmfresh_token");
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await API.put("/auth/update-profile", updates);
    setUser(data.data);
    return data.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
