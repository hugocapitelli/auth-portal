import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eximIA Auth",
  description: "Central de autenticação do ecossistema eximIA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
