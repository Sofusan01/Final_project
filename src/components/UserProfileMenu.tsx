// src/components/UserProfileMenu.tsx
import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronUp, ChevronDown } from "lucide-react";

interface UserProfileMenuProps {
    collapsed: boolean;
    user: { firstName: string; lastName: string } | null;
    onLogout: () => void;
}

function UserProfileMenu({ collapsed, user, onLogout }: UserProfileMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // ปิด dropdown เมื่อคลิกนอก
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        }
        if (open) window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, [open]);

    // แสดงชื่อผู้ใช้
    const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Loading...";

    if (collapsed) {
        return (
            <div className="flex justify-center">
                <button
                    className="w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-800 flex items-center justify-center shadow group relative"
                    title={displayName}
                >
                    <User className="w-6 h-6 text-white" />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 text-xs pointer-events-none whitespace-nowrap z-50">
                        {displayName}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-900/80 hover:bg-blue-800/90 text-white transition"
            >
                <User className="w-6 h-6" />
                <span className="font-semibold text-sm truncate">
                    {displayName}
                </span>
                {open ? (
                    <ChevronUp className="ml-auto w-4 h-4 flex-shrink-0" />
                ) : (
                    <ChevronDown className="ml-auto w-4 h-4 flex-shrink-0" />
                )}
            </button>
            {open && (
                <div className="absolute left-0 bottom-full mb-2 w-full rounded-lg bg-slate-900/95 shadow-xl ring-1 ring-blue-700/30 z-50">
                    <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50/10 rounded-lg transition"
                        onClick={onLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        ออกจากระบบ
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserProfileMenu;
