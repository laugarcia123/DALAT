import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Dalat - Asistente de Estudio Inteligente",
  description: "Plataforma inteligente de organización, metas y concentración para estudiantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full bg-[#080a11] text-slate-100 font-sans selection:bg-[#7c5dfa] selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
