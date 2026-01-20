"use client";

import { createContext, useEffect } from "react";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export const authContext = createContext({
  user: null,
  loading: false,
  googleLoginHandler: async () => {},
  logout: async () => {},
});

export default function AuthContextProvider({ children }) {
  console.log("AuthContextProvider mounting...");

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    console.log("Auth state changed:");
    console.log("- User:", user?.email || "Not logged in");
    console.log("- Loading:", loading);
    console.log("- Error:", error);
  }, [user, loading, error]);

  const googleProvider = new GoogleAuthProvider(auth);

  const googleLoginHandler = async () => {
    console.log("Google login initiated...");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Login successful:", result.user.email);
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logout initiated...");
    signOut(auth);
  };

  const values = {
    user,
    loading,
    googleLoginHandler,
    logout,
  };

  return <authContext.Provider value={values}>{children}</authContext.Provider>;
}