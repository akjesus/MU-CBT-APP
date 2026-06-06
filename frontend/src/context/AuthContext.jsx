import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // {role, token, email, name}

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
