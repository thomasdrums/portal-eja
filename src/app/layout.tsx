import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal EJA",
  description: "Portal de gestão acadêmica para Educação de Jovens e Adultos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
