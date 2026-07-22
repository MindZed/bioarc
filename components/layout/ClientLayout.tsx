// components/layout/ClientLayout.tsx
// This file will be used to handle the layout of the application

"use client";

import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/hooks/useWebSocket";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, toggleSidebar } = useStore();
  const [mounted, setMounted] = useState(false);

  // Establish live WebSocket connection to Go Backend
  useWebSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for mount to apply dynamic classes based on store
  const marginLeftClass = !mounted ? "ml-[64px]" : (isSidebarCollapsed ? "ml-[64px]" : "ml-[280px]");

  return (
    <div className="flex overflow-hidden w-full h-full">
      <Sidebar />
      <main className={`max-md:ml-0 ${marginLeftClass} flex-1 flex flex-col h-screen overflow-y-auto bg-surface-container-low transition-all duration-300 ease-in-out w-full`}>
        {children}
      </main>
    </div>
  );
}
