"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useStore();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "Metrics", href: "/metrics", icon: "analytics" },
    { name: "Chatbot", href: "/chatbot", icon: "smart_toy" },
    { name: "Maintenance", href: "/maintenance", icon: "engineering" },
  ];

  return (
    <nav className={`bg-surface-container-lowest/80 backdrop-blur-xl fixed left-0 top-0 h-full ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'} border-r border-outline-variant shadow-lg flex flex-col py-6 px-4 z-50 transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-8`}>
        <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'hidden' : 'px-2'} transition-opacity duration-300`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-bold shadow-[0_0_15px_rgba(78,222,163,0.3)]">B</div>
          <div>
            <h1 className="font-headline-md text-[24px] font-bold text-primary leading-none tracking-tight">BioArc</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">IoT Control</p>
          </div>
        </div>
        
        <button 
          onClick={toggleSidebar} 
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container/50 rounded-lg transition-colors border border-transparent hover:border-outline-variant"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>
      
      {!isSidebarCollapsed && (
        <div className="text-[10px] font-bold text-on-surface-variant mb-4 px-2 tracking-widest uppercase transition-opacity duration-300">
          General
        </div>
      )}
      
      <ul className="space-y-2 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.name}>
              <Link 
                href={item.href} 
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(78,222,163,0.1)] border border-primary/20' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent'
                }`} 
                title={item.name}
              >
                <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                {!isSidebarCollapsed && <span className="font-label-md text-[14px] font-medium">{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      
      <ul className="space-y-1 mt-auto border-t border-outline-variant/50 pt-4">
        <li>
          <Link href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 border border-transparent`} title="Help Center">
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            {!isSidebarCollapsed && <span className="font-label-md text-[13px]">Help Center</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
