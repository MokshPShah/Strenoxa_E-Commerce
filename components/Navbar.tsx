"use client";

import Link from "next/link";
import { FaShoppingCart, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const [searchTerm, setSearchTerm] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm("");
            setIsMobileMenuOpen(false);
        }
    };

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-white border-b border-slate-100 z-50 flex items-center shadow-sm">
                <div className="max-w-[1400px] w-full mx-auto px-3 md:px-8 flex items-center justify-between gap-2 md:gap-6">

                    {/* LEFT: Hamburger, Logo, and Desktop Links */}
                    <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden text-slate-900 hover:text-[#ec1313] transition-colors cursor-pointer p-1"
                        >
                            <FaBars size={22} />
                        </button>

                        <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tighter cursor-pointer">
                            STRENOXA<span className="text-[#ec1313]">.</span>
                        </Link>

                        {/* Desktop Links (Hidden below 'lg') */}
                        <div className="hidden lg:flex items-center gap-6 xl:gap-8 ml-4">
                            <Link href="/shop" className="text-xs font-bold text-slate-900 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">Shop All</Link>
                            <Link href="/shop?category=protein" className="text-xs font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">Protein</Link>
                            <Link href="/shop?category=pre-workout" className="text-xs font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">Pre-Workout</Link>
                            <Link href="/shop?category=creatine" className="text-xs font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">Creatine</Link>
                            <Link href="/shop?category=apparel" className="text-xs font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">Apparel</Link>
                        </div>
                    </div>

                    {/* CENTER: Universal Search Bar (Shows in the middle on ALL screens) */}
                    <div className="flex-1 max-w-2xl mx-1 sm:mx-4">
                        <form onSubmit={handleSearch} className="relative flex items-center w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs md:text-sm font-medium rounded-full py-2.5 md:py-3.5 pl-4 md:pl-6 pr-10 md:pr-12 focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all"
                            />
                            <button type="submit" className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-slate-400 hover:text-[#ec1313] transition-colors cursor-pointer">
                                <FaSearch size={14} className="md:w-[16px] md:h-[16px]" />
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: User & Cart */}
                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        <div className="flex items-center">
                            <UserDropdown />
                        </div>

                        <Link href="/cart" className="relative text-slate-900 hover:text-[#ec1313] transition-colors cursor-pointer p-1">
                            <FaShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[#ec1313] text-white text-[9px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>

                </div>
            </header>

            {/* MOBILE MENU OVERLAY & DRAWER */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden font-sans">
                    {/* Dark Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                            <span className="text-xl font-black text-slate-950 tracking-tighter">
                                STRENOXA<span className="text-[#ec1313]">.</span>
                            </span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-[#ec1313] hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col p-6 space-y-6 overflow-y-auto">
                            <Link href="/shop" onClick={handleLinkClick} className="text-sm font-black text-slate-900 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">
                                Shop All
                            </Link>
                            <Link href="/shop?category=protein" onClick={handleLinkClick} className="text-sm font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">
                                Protein
                            </Link>
                            <Link href="/shop?category=pre-workout" onClick={handleLinkClick} className="text-sm font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">
                                Pre-Workout
                            </Link>
                            <Link href="/shop?category=creatine" onClick={handleLinkClick} className="text-sm font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">
                                Creatine
                            </Link>
                            <Link href="/shop?category=apparel" onClick={handleLinkClick} className="text-sm font-bold text-slate-500 hover:text-[#ec1313] transition-colors cursor-pointer uppercase tracking-widest">
                                Apparel
                            </Link>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}