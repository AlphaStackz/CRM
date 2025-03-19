// context/UserContext.js
import { createContext, useContext, useState } from "react";

// Create the context
const UserContext = createContext();

// Custom hook for accessing the user context
export const useUser = () => useContext(UserContext);

// User provider to wrap the application
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to log in
  const login = (userData) => {
    setUser(userData);
  };

  // Function to log out
  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
