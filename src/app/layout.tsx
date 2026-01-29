import Header from "@/components/header";
import { Sidebar } from "@/components/Sidebar";
import { getUser } from "@/lib/backend/user";
import "@mantine/charts/styles.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";
import { getUserFromToken } from "@/lib/auth";
import { UserProvider } from "../../context/UserContext";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trajectory",
  description: "Trajectory — your career path, visualized",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromToken();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-white dark:black`}
      >
        {" "}
        <Providers>
          <UserProvider user={user}>
            {/* <ToastContainer /> */}
            {/* <MantineProvider defaultColorScheme="auto"> */}
              <div className="flex flex-col h-screen">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto">{children}</main>
                </div>
              </div>
            {/* </MantineProvider> */}
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
