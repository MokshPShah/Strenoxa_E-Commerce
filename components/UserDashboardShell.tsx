"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaShoppingBag, FaUser, FaHeart, FaHome, FaSignOutAlt } from "react-icons/fa";

export default function UserDashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const getLinkClasses = (path: string) => {
        const isActive = pathname === path;
        const base = "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer";
        return isActive
            ? `${base} bg-[#ec1313] text-white shadow-lg shadow-red-500/20`
            : `${base} text-slate-500 hover:bg-slate-50 hover:text-slate-900`;
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-20 lg:pt-32 pb-12 px-4">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8 xl:gap-12">

                {/* 2. PREVENT SQUISHING: Added shrink-0 so it strictly stays w-64 */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Account Menu</p>
                        <nav className="flex flex-col gap-1">
                            <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
                                <FaUser /> My Profile
                            </Link>
                            <Link href="/dashboard/orders" className={getLinkClasses("/dashboard/orders")}>
                                <FaShoppingBag /> Order History
                            </Link>
                            <Link href="/dashboard/favorites" className={getLinkClasses("/dashboard/favorites")}>
                                <FaHeart /> Favorites
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        </div>
    );
}