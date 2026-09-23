import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// In fullstack AI Studio environment, frontend and backend share the same origin.
// All requests (/api/...) and WebSockets route directly to our local server.
const backendUrl = "";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setAuthUser(null);
      return;
    }
    try {
      axios.defaults.headers.common["token"] = savedToken;
      const { data } = await axios.get("/api/auth/check");
      if (data.success && data.user) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
      }
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
    }
  };

  //login func to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error(errMsg);
    }
  };

  //logout func
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    toast.success("Logged out successfully");
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  //update user profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success && (data.user || data.userData)) {
        setAuthUser(data.user || data.userData);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error(errMsg);
    }
  };

  //connect socket function to handle socket connection & online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl || undefined, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
