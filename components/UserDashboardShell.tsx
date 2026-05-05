"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react"; // <--- Added for real logout functionality
import { FaHome, FaHistory, FaMapMarkerAlt, FaCog, FaHeart, FaSignOutAlt } from "react-icons/fa";

export default function UserDashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navLinks = [
        { name: "Dashboard", href: "/dashboard", icon: <FaHome size={16} /> },
        { name: "Orders", href: "/dashboard/orders", icon: <FaHistory size={16} /> },
        { name: "Addresses", href: "/dashboard/addresses", icon: <FaMapMarkerAlt size={16} /> },
        { name: "Favorites", href: "/dashboard/favorites", icon: <FaHeart size={16} /> },
        { name: "Settings", href: "/dashboard/settings", icon: <FaCog size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-28 md:pt-32 pb-24">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 md:gap-8">

                {/* MOBILE NAVIGATION: Highly Optimized Horizontal Swipe */}
                <div className="block md:hidden w-full mb-2 relative">

                    {/* The Scrollable Container */}
                    {/* Added pr-12 (padding-right) so the last item doesn't get stuck under the gradient */}
                    <div className="flex overflow-x-auto gap-3 pb-4 pr-12 hide-scrollbar snap-x touch-pan-x">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex-shrink-0 snap-start flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${isActive
                                            ? 'bg-[#ec1313] text-white shadow-lg shadow-red-500/30'
                                            : 'bg-white text-slate-500 border border-slate-100 hover:text-slate-900 shadow-sm'
                                        }`}
                                >
                                    {link.icon} {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* THE FIX: Right-side Gradient Fade Indicator */}
                    <div className="absolute top-0 right-0 h-12 w-16 bg-gradient-to-l from-[#f8f9fa] to-transparent pointer-events-none"></div>

                </div>

                {/* DESKTOP NAVIGATION: Sticky Sidebar */}
                <div className="hidden md:block w-72 flex-shrink-0">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 sticky top-32 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 px-2">
                            My Account
                        </h2>
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all cursor-pointer ${isActive
                                                ? 'bg-[#ec1313] text-white shadow-md shadow-red-500/20'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <span>{link.icon}</span>
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Divider */}
                            <div className="h-px bg-slate-100 my-4 mx-2"></div>

                            {/* Functional Logout Button */}
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-slate-500 hover:bg-red-50 hover:text-[#ec1313] transition-all border border-transparent cursor-pointer text-left w-full"
                            >
                                <span><FaSignOutAlt size={18} /></span>
                                Log Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-grow w-full max-w-full overflow-hidden">
                    {children}
                </div>

            </div>
        </div>
    );
}