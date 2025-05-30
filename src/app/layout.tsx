import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactDOM from "react-dom";
import Head from "next/head";
require('dotenv').config()

import BottomNavBar from '../components/bottom_navbar/bottom_navbar';

import styles from "./layout.module.css";




const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beehex",
  description: "Jeu de hex",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body className={`${inter.className}`}>
          <div>{children}</div>
          <BottomNavBar />
          
        </body>
      </html>
    </>
  );
}

