'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import {
  Home,
  Upload,
  FileSearch,
  History,
  FolderOpen,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  Tags
} from "lucide-react";
import { useState, useEffect } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { CaseVaultLogoCompact } from "./ui/casevault-logo";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink = ({ href, label, icon, onClick }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
        "text-gray-300 hover:text-white hover:bg-brand-secondary/20",
        isActive && "bg-brand-secondary text-white font-medium shadow-lg shadow-brand-secondary/50"
      )}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  
  // Close sidebar when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 z-40 md:hidden">
        <button
          className="p-2 rounded-lg bg-brand-darkCard shadow-lg border border-brand-darkBorder text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-brand-darkBg border-r border-brand-darkBorder shadow-xl transition-transform duration-300 transform",
          "md:translate-x-0 md:sticky flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and App Title */}
        <div className="h-16 flex items-center justify-center border-b border-brand-darkBorder bg-brand-darkCard">
          <CaseVaultLogoCompact size={36} />
          <div className="ml-3">
            <div className="text-base font-bold text-white">CaseVault</div>
            <div className="text-xs text-brand-accent font-semibold">Pro</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={<Home size={18} />}
            onClick={closeSidebar}
          />
          <SidebarLink
            href="/upload"
            label="Upload Evidence"
            icon={<Upload size={18} />}
            onClick={closeSidebar}
          />
          <SidebarLink
            href="/analysis"
            label="Analysis"
            icon={<FileSearch size={18} />}
            onClick={closeSidebar}
          />
          <SidebarLink
            href="/cases"
            label="Cases"
            icon={<FolderOpen size={18} />}
            onClick={closeSidebar}
          />
          <div className="my-2 border-t border-brand-darkBorder"></div>
          <SidebarLink
            href="/chain-of-custody"
            label="Chain of Custody"
            icon={<Shield size={18} />}
            onClick={closeSidebar}
          />
          <SidebarLink
            href="/search"
            label="Search"
            icon={<Search size={18} />}
            onClick={closeSidebar}
          />
          <SidebarLink
            href="/tags"
            label="Tags"
            icon={<Tags size={18} />}
            onClick={closeSidebar}
          />
          <SidebarLink
            href="/reports"
            label="Reports"
            icon={<FileText size={18} />}
            onClick={closeSidebar}
          />
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-brand-darkBorder">
          <SignOutButton>
            <button
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors w-full rounded-lg px-3 py-2 hover:bg-brand-danger/20 focus:outline-none focus:ring-2 focus:ring-brand-danger"
              aria-label="Sign out"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}; 