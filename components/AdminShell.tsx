"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaBoxOpen, FaClipboardList, FaUsers, FaChartBar, FaCog,
    FaSignOutAlt, FaSearch, FaBell, FaTicketAlt, FaBolt, FaBars, FaTimes,
    FaTrashRestore // <-- Added this import
} from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";

interface AdminShellProps {
    userRole: string;
    userName: string;
    children: React.ReactNode;
}

export default function AdminShell({ userRole, userName, children }: AdminShellProps) {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    const pathname = usePathname();
    const isSuperAdmin = userRole === "super admin";

    const isActiveExact = (path: string) => pathname === path;
    const isActivePartial = (path: string) => pathname?.startsWith(path);

    const getLinkClasses = (path: string, exact: boolean = false) => {
        const isActive = exact ? isActiveExact(path) : isActivePartial(path);
        const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm cursor-pointer transition-colors";

        if (isActive) {
            return `${baseClasses} bg-[#ec1313] text-white shadow-md shadow-red-500/20`;
        }
        return `${baseClasses} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
    };

    const handleBellClick = async () => {
        setIsLogOpen(!isLogOpen);
        if (!isLogOpen && logs.length === 0) {
            setIsLoadingLogs(true);
            try {
                const res = await fetch('/api/admin/logs');
                const data = await res.json();
                if (data.logs) setLogs(data.logs);
            } catch (error) {
                console.error("Failed to fetch logs");
            } finally {
                setIsLoadingLogs(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans">

            {/* Mobile Sidebar Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/20 z-40 md:hidden backdrop-blur-sm transition-opacity cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out`}>

                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#ec1313] rounded flex items-center justify-center text-white">
                            <FaBolt size={14} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 leading-tight">Strenoxa</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {isSuperAdmin ? "Super Admin" : "Admin Operations"}
                            </p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        className="md:hidden text-slate-400 hover:text-slate-900 p-2 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-grow mt-2 overflow-y-auto">
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin", true)}>
                        <FaChartBar /> Dashboard
                    </Link>

                    {isSuperAdmin ? (
                        <>
                            <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/users")}>
                                <FaUsers /> Users
                            </Link>
                            <Link href="/admin/inventory" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/inventory", true)}>
                                <FaBoxOpen /> Inventory
                            </Link>
                            {/* NEW: Recycle Bin Link for Super Admin */}
                            <Link href="/admin/inventory/bin" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/inventory/bin")}>
                                <FaTrashRestore /> Recycle Bin
                            </Link>
                            <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/orders")}>
                                <FaClipboardList /> Orders
                            </Link>

                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4">Management</span>
                            <Link href="/admin/reports" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/reports")}>
                                <FaChartBar /> Reports
                            </Link>
                            <Link href="/admin/settings" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/settings")}>
                                <FaCog /> Site Settings
                            </Link>
                            <Link href="/admin/coupons" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/coupons")}>
                                <FaChartBar /> Coupons
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/orders")}>
                                <FaClipboardList /> Orders
                            </Link>
                            <Link href="/admin/inventory" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/inventory", true)}>
                                <FaBoxOpen /> Inventory
                            </Link>
                            {/* NEW: Recycle Bin Link for Admin */}
                            <Link href="/admin/inventory/bin" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/inventory/bin")}>
                                <FaTrashRestore /> Recycle Bin
                            </Link>
                            <Link href="/admin/coupons" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/brands")}>
                                <FaChartBar /> Coupons
                            </Link>

                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4">System</span>
                            <Link href="/admin/settings" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses("/admin/settings")}>
                                <FaCog /> Settings
                            </Link>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 m-4 bg-slate-50 rounded-xl flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {session?.user?.image ? (
                                <img src={session?.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                    {session?.user?.name?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>
                        <div className="truncate pr-2">
                            <p className="text-sm font-bold text-slate-900 leading-none truncate">{userName}</p>
                            <p className="text-xs text-slate-500 mt-1 capitalize truncate">{isSuperAdmin ? "Super Admin" : "Ops Manager"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            signOut({ callbackUrl: '/' });
                        }}
                        className="text-slate-400 hover:text-[#ec1313] p-2 cursor-pointer flex-shrink-0"
                    >
                        <FaSignOutAlt className="text-slate-400" />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            className="md:hidden text-slate-500 hover:text-slate-900 p-2 cursor-pointer"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <FaBars size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 ml-4 relative">
                        <button
                            onClick={handleBellClick}
                            className="relative text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full border border-slate-200 cursor-pointer flex-shrink-0 transition-colors"
                        >
                            <FaBell size={16} />
                            {/* Optional: Add a red dot only if there are logs (we'll keep it static for now) */}
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#ec1313] rounded-full border border-white"></span>
                        </button>

                        {/* The Activity Log Dropdown */}
                        {isLogOpen && (
                            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <h3 className="font-black text-slate-900 text-sm">Activity Log</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 10 Actions</span>
                                </div>

                                <div className="max-h-80 overflow-y-auto p-2">
                                    {isLoadingLogs ? (
                                        <p className="text-center text-xs text-slate-400 py-6 font-medium">Loading logs...</p>
                                    ) : logs.length === 0 ? (
                                        <p className="text-center text-xs text-slate-400 py-6 font-medium">No recent activity.</p>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {logs.map((log, idx) => (
                                                <div key={idx} className="p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <p className="text-xs font-bold text-slate-900">{log.action}</p>
                                                    {log.details && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{log.details}</p>}
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-[10px] font-bold text-[#ec1313] truncate max-w-[150px]">{log.userEmail}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">
                                                            {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow p-4 sm:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}