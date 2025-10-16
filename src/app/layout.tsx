"use client";
import { Inter, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
// import "./globals.css";
import ClientLayout from './components/ClientLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

import "./media.css"
import "./custom.css"
import "../../style.css"



import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
// import "@/styles/style 2.css"; 
// import "@/styles/style.css";
// import "@/styles/custom.css";
//import "@/styles/media.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Optional metadata
// export const metadata: Metadata = {
//   title: "UpKraft",
//   description: "Learn from experts with UpKraft",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Google Analytics 4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-4SD69BX3GR"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4SD69BX3GR'); // Replace with your GA4 Measurement ID
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
