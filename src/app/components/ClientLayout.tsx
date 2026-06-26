"use client";
 
// Static imports for CSS
import "rsuite/dist/rsuite.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
 
// Local CSS imports
// import "../../app/globals.css";
import "@/styles/globals.css";
import "../../app/custom.css";
import "../../../style.css";
import "../../app/academy.css"
import "../../app/academyMedia.css"
import "../../app/media.css";
// import "../../app/academyStyle.css"
//import "@/styles/index.css";
//import "../../app/media.css";
//import "../../app/custom.css";
//import "@/styles/style.css";
 
import { Toaster } from "react-hot-toast";
import Chat from "./Chat";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserDataProvider } from "../providers/UserData/page";
 
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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

  useEffect(() => {
    const cleanupOrphanBackdrops = () => {
      const hasVisibleModal = Boolean(
        document.querySelector(".modal.show, .offcanvas.show")
      );

      if (hasVisibleModal) return;

      document.querySelectorAll(".modal-backdrop").forEach((node) => {
        node.parentElement?.removeChild(node);
      });

      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    };

    // Run on route transitions and once after paint in case a modal unmount races.
    cleanupOrphanBackdrops();
    const timerId = window.setTimeout(cleanupOrphanBackdrops, 120);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pathname]);
 
  return (
    <>
    <UserDataProvider>
      <Toaster position="top-center" />
      {children}
      {/* <Chat /> */}
    </UserDataProvider>
    </>
  );
}