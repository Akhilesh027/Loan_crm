// src/contexts/AuthContext.js (Updated)
import React, { createContext, useState, useContext, useEffect } from "react";
import authAPI  from "../services/authAPI.js";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userData && userRole) {
      setCurrentUser({
        ...JSON.parse(userData),
        role: userRole
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    try {
      const data = await authAPI.login({ username, password, role });
      
      // Store authentication data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setCurrentUser({
        ...data.user,
        role: data.user.role
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}