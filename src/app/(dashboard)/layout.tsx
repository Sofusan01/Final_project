// src/app/(dashboard)/layout.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const userProfile = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (userProfile === null) {
            router.replace("/login");
        }
    }, [userProfile, router]);

    if (userProfile === undefined) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <span className="text-slate-600 text-lg">Loading...</span>
                </div>
            </div>
        );
    }

    if (userProfile === null) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                user={userProfile}
            />
            <main
                className={`
                    flex-1 transition-all duration-300 ease-in-out
                    min-h-screen
                    ${collapsed ? "md:ml-16" : "md:ml-64"}
                    ml-0
                    bg-white/70 dark:bg-gray-800/70 backdrop-blur-md

                `}
            >
                <div className="p-4 sm:p-6 pt-20 md:pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
