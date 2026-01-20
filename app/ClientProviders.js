"use client";

import { ToastContainer } from "react-toastify";
import Nav from "@/components/Navigation";
import FinanceContextProvider from "@/lib/store/finance-context";
import AuthContextProvider from "@/lib/store/auth-context";

export default function ClientProviders({ children }) {
  return (
    <AuthContextProvider>
      <FinanceContextProvider>
        <ToastContainer />
        <Nav />
        {children}
      </FinanceContextProvider>
    </AuthContextProvider>
  );
}