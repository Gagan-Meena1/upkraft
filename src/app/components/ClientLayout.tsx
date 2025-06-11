"use client"

import { Toaster } from "react-hot-toast";
import Chat from './Chat';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-center" />
      {children}
      <Chat />
    </>
  );
} 