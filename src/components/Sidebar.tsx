// src/components/Sidebar.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    BarChart2,
    ChevronLeft,
    X,
    Sprout,
    Cog,
    Menu
} from "lucide-react";
import UserProfileMenu from "./UserProfileMenu";
import { supabase } from "@/lib/supabase";

const menu = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Console", icon: Settings, href: "/console" },
    { label: "Result", icon: BarChart2, href: "/result" },
    { label: "Settings", icon: Cog, href: "/setting" },
];

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    user: { firstName: string; lastName: string } | null;
}

// Hamburger Icon Component
const HamburgerIcon = ({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col justify-center items-center w-8 h-8 space-y-1 group"
            aria-label="Toggle menu"
        >
            <div
                className={`w-6 h-0.5 bg-white transition-all duration-300 ${collapsed ? 'rotate-0' : 'rotate-45 translate-y-2'
                    }`}
            />
            <div
                className={`w-6 h-0.5 bg-white transition-all duration-300 ${collapsed ? 'opacity-100' : 'opacity-0'
                    }`}
            />
            <div
                className={`w-6 h-0.5 bg-white transition-all duration-300 ${collapsed ? 'rotate-0' : '-rotate-45 -translate-y-2'
                    }`}
            />
        </button>
    );
};

export default function Sidebar({ collapsed, setCollapsed, user }: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isActive = useCallback((href: string) => pathname === href, [pathname]);

    // ปิด mobile menu เมื่อเปลี่ยนหน้า
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // ป้องกัน scroll เมื่อเปิด mobile menu
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileOpen]);

    const handleNavigation = useCallback((href: string) => {
        setMobileOpen(false);
        if (pathname !== href) {
            router.push(href);
        }
    }, [pathname, router]);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)"
                }}
                aria-label="เปิดเมนู"
            >
                <Menu className="w-6 h-6 text-white" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-50
                    flex flex-col
                    text-white shadow-2xl transition-all duration-300 ease-in-out
                    border-r border-slate-700/50
                    ${collapsed ? "w-16" : "w-64"}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:z-30
                `}
                style={{
                    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b h-20 relative overflow-hidden"
                    style={{
                        borderBottomColor: "rgba(34, 197, 94, 0.3)",
                        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)"
                    }}
                >
                    {/* Logo - แสดงเฉพาะเมื่อไม่ fold */}
                    {!collapsed && (
                        <button
                            onClick={() => handleNavigation("/dashboard")}
                            className="flex items-center gap-3 group relative z-10"
                        >
                            <div
                                className="rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300"
                                style={{
                                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                                    boxShadow: "0 8px 25px rgba(34, 197, 94, 0.2)"
                                }}
                            >
                                <Sprout className="w-7 h-7 text-green-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl sm:text-2xl text-white tracking-wide">
                                    Wolffia
                                </span>
                                <span className="text-xs text-green-200 font-medium tracking-wider uppercase">
                                    Plant Dashboard
                                </span>
                            </div>
                        </button>
                    )}

                    {/* Hamburger Icon - แสดงเฉพาะเมื่อ fold */}
                    {collapsed && (
                        <div className="flex justify-center w-full">
                            <HamburgerIcon
                                collapsed={collapsed}
                                onClick={() => setCollapsed(!collapsed)}
                            />
                        </div>
                    )}

                    {/* Control Buttons - แสดงเฉพาะเมื่อไม่ fold */}
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            {/* Desktop collapse button */}
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                                style={{
                                    background: "rgba(34, 197, 94, 0.1)",
                                    border: "1px solid rgba(34, 197, 94, 0.2)"
                                }}
                                aria-label="ย่อ/ขยายเมนู"
                            >
                                <ChevronLeft className="w-4 h-4 text-green-300" />
                            </button>

                            {/* Mobile close button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                                style={{
                                    background: "rgba(34, 197, 94, 0.1)",
                                    border: "1px solid rgba(34, 197, 94, 0.2)"
                                }}
                                aria-label="ปิดเมนู"
                            >
                                <X className="w-4 h-4 text-green-300" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 flex flex-col py-4 px-2 space-y-2">
                    {menu.map(({ label, icon: Icon, href }) => {
                        const active = isActive(href);
                        return (
                            <button
                                onClick={() => handleNavigation(href)}
                                key={href}
                                className={`
                                    group relative flex items-center rounded-xl transition-all duration-200
                                    ${collapsed ? "justify-center p-3" : "px-4 py-3"}
                                    ${active
                                        ? "text-white font-bold shadow-lg"
                                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"}
                                `}
                                style={{
                                    background: active
                                        ? "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
                                        : "transparent",
                                }}
                            >
                                <Icon className={`flex-shrink-0 ${collapsed ? "w-6 h-6" : "w-5 h-5"}`} />
                                {!collapsed && (
                                    <span className="ml-3 font-medium whitespace-nowrap text-sm sm:text-base">
                                        {label}
                                    </span>
                                )}

                                {/* Tooltip for collapsed */}
                                {collapsed && (
                                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-600">
                                        {label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Menu */}
                <div className="px-2 pb-4">
                    <UserProfileMenu
                        collapsed={collapsed}
                        user={user}
                        onLogout={async () => {
                            await supabase.auth.signOut();
                            setMobileOpen(false);
                            window.location.href = "/login";
                        }}
                    />
                </div>
            </aside>
        </>
    );
}
