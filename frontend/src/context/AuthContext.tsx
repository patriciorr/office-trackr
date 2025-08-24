import React, { createContext, useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "coworker";
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    if (user) {
      localStorage.setItem("user", JSON.stringify({ ...user, ...updates }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
