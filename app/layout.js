import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import ClientProviders from "./ClientProviders";

export const metadata = {
  title: "Expense Tracker",
  description: "Track your income and expenses efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}