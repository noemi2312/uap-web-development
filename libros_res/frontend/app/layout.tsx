import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
