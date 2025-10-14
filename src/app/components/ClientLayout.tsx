"use client";

// Static imports for CSS
import "rsuite/dist/rsuite.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Local CSS imports
import "@/styles/globals.css";
import "@/styles/index.css";
//import "../../app/media.css";
//import "../../app/custom.css";
import "@/styles/style.css";

import { Toaster } from "react-hot-toast";
import Chat from "./Chat";
import { useEffect } from "react";  

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Dynamic import for Bootstrap JavaScript only on the client side
    const loadBootstrap = async () => {
      try {
        await import("bootstrap/dist/js/bootstrap.bundle.min.js");
      } catch (error) {
        console.error("Error loading Bootstrap:", error);
      }
    };

    loadBootstrap();
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      {children}
      {/* <Chat /> */}
    </>
  );
}
