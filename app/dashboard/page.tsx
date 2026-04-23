"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FaHeart, 
  FaCartPlus, 
  FaBoxOpen, 
  FaSpinner, 
  FaHistory, 
  FaMapMarkerAlt, 
  FaCog, 
  FaArrowRight, 
  FaUserCircle 
} from "react-icons/fa";

export interface DashboardSummary {
  favoriteCount: number;
  validCartItemCount: number;
  outOfStockCartItemCount: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/dashboard/summary');
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center pt-24">
        <FaSpinner className="animate-spin text-4xl text-[#ec1313]" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-12 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                <FaUserCircle size={64} className="mt-2" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#ec1313] uppercase tracking-widest mb-1">Welcome Back</p>
              <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
                Your Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Top Summary Stats */}
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">At a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 bg-red-50 text-[#ec1313] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <FaHeart size={24} />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{summary.favoriteCount}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Saved Items</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <FaCartPlus size={24} />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{summary.validCartItemCount}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">In Cart</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <FaBoxOpen size={24} />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{summary.outOfStockCartItemCount}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Out of Stock</p>
            </div>
          </div>

        </div>

        {/* Account Management Links */}
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Account Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <DashboardLink 
            href="/dashboard/orders"
            icon={<FaHistory size={20} />}
            title="Order History"
            description="Track packages, view receipts, and buy again."
          />
          
          <DashboardLink 
            href="/dashboard/addresses"
            icon={<FaMapMarkerAlt size={20} />}
            title="Saved Addresses"
            description="Manage your shipping and billing locations."
          />
          
          <DashboardLink 
            href="/dashboard/settings"
            icon={<FaCog size={20} />}
            title="Account Settings"
            description="Update your password, email, and preferences."
          />
          
          <DashboardLink 
            href="/favorites"
            icon={<FaHeart size={20} />}
            title="Your Wishlist"
            description="View and manage your favorited gear."
          />

        </div>

      </div>
    </div>
  );
}

// Reusable link component for the bottom grid
function DashboardLink({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link href={href} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-colors duration-300 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-[#ec1313] transition-colors">{title}</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>
        </div>
      </div>
      <div className="text-slate-300 group-hover:text-[#ec1313] transition-all transform group-hover:translate-x-1 flex-shrink-0 ml-4 hidden sm:block">
        <FaArrowRight />
      </div>
    </Link>
  );
}