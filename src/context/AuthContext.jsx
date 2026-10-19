import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("auctionpro_token");
    sessionStorage.removeItem("auctionpro_token");
    localStorage.removeItem("auctionpro_auction_id");
    sessionStorage.removeItem("auctionpro_auction_id");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("auctionpro_token") || sessionStorage.getItem("auctionpro_token");
    if (token && !localStorage.getItem("auctionpro_token")) localStorage.setItem("auctionpro_token", token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const currentUser = response.data.user;
      if (!["admin", "user"].includes(currentUser?.role)) {
        localStorage.removeItem("auctionpro_token");
    sessionStorage.removeItem("auctionpro_token");
        setUser(null);
      } else {
        setUser(currentUser);
      }
    } catch {
      localStorage.removeItem("auctionpro_token");
    sessionStorage.removeItem("auctionpro_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username, password) => {
    const response = await api.post("/auth/admin/login", { username, password });
    if (!response.data?.token || response.data?.user?.role !== "admin") {
      throw new Error("An Admin account is required to access this dashboard.");
    }
    localStorage.setItem("auctionpro_token", response.data.token);
    sessionStorage.removeItem("auctionpro_token");
    setUser(response.data.user);
    return response.data.user;
  };

  const loginUser = async (username, password, auctionId) => {
    const response = await api.post("/auth/user/login", {
      username,
      password,
      auctionId,
    });
    if (!response.data?.token || response.data?.user?.role !== "user") {
      throw new Error("A valid user account is required.");
    }
    localStorage.setItem("auctionpro_token", response.data.token);
    sessionStorage.removeItem("auctionpro_token");
    localStorage.setItem("auctionpro_auction_id", String(auctionId).trim().toUpperCase());
    sessionStorage.removeItem("auctionpro_auction_id");
    setUser(response.data.user);
    return response.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
