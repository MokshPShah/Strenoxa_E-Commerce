"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
    FaUser, FaHeart, FaBoxOpen, FaShieldAlt,
    FaSignOutAlt, FaChevronDown,
    FaTicketAlt,
    FaCogs,
    FaMapMarkerAlt
} from "react-icons/fa";
import { FaChartLine, FaClipboardList, FaHeadset, FaTags } from "react-icons/fa6";

export default function UserDropdown() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (status === "loading") {
        return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>;
    }

    if (!session) {
        return (
            <Link
                href="/login"
                className="text-sm font-bold text-white bg-[#ec1313] hover:bg-[#c40f0f] px-3 py-2 rounded transition-colors cursor-pointer"
            >
                Sign In
            </Link>
        );
    }

    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === "admin" || userRole === "super admin";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
            >
                {session.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                        {session.user?.name?.charAt(0) || "U"}
                    </div>
                )}
                <FaChevronDown className={`text-slate-400 text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 transform origin-top-right transition-all">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                        <p className="text-sm font-black text-slate-900 truncate">{session.user?.name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{session.user?.email}</p>
                        {isAdmin ? (
                            <span className="inline-block mt-1 bg-red-100 text-[#ec1313] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                {userRole}
                            </span>
                        ) : (
                            <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center w-fit gap-1">
                                Strenoxa Member
                            </span>
                        )}
                    </div>

                    {/* Admin Link (Only visible to admins) */}
                    {isAdmin && (
                        <>
                            <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaChartLine className="text-slate-400" /> Dashboard
                            </Link>
                            <Link href="/admin/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaClipboardList className="text-slate-400" /> Manage Orders
                            </Link>
                            <Link href="/admin/inventory" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaTags className="text-slate-400" /> Inventory
                            </Link>
                            <Link href="/admin/coupons" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaTicketAlt className="text-slate-400" /> Coupons
                            </Link>
                            <Link href="/admin/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaCogs className="text-slate-400" /> Store Settings
                            </Link>
                        </>
                    )}

                    {!isAdmin && (
                        <>
                            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaUser className="text-slate-400" /> My Profile
                            </Link>
                            <Link href="/dashboard/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaBoxOpen className="text-slate-400" /> Shop Records
                            </Link>
                            <Link href="/dashboard/favorites" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaHeart className="text-slate-400" /> Saved Favorites
                            </Link>
                            <Link href="/dashboard/addresses" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaMapMarkerAlt className="text-slate-400" /> Address Book
                            </Link>

                            <div className="border-t border-slate-50 my-1"></div>

                            <a href="mailto:support@strenoxa.com" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaHeadset className="text-slate-400" /> Help & Support
                            </a>
                        </>
                    )}




                    {/* Logout */}
                    <div className="border-t border-slate-100 mt-2 pt-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-red-50 hover:text-[#ec1313] transition-colors cursor-pointer"
                        >
                            <FaSignOutAlt className="text-slate-400" /> Sign Out
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}