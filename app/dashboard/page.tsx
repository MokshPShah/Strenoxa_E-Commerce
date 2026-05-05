"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaHeart, FaCartPlus, FaBoxOpen, FaSpinner, FaUserCircle } from "react-icons/fa";
import UserDashboardShell from "@/components/UserDashboardShell";

export interface DashboardSummary {
  favoriteCount: number;
  validCartItemCount: number;
  outOfStockCartItemCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || "Athlete";

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
      <UserDashboardShell>
        <div className="flex items-center justify-center py-32">
          <FaSpinner className="animate-spin text-4xl text-[#ec1313]" />
        </div>
      </UserDashboardShell>
    );
  }

  if (!summary) return null;

  return (
    <UserDashboardShell>
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-8 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden">
            <FaUserCircle className="w-16 h-16 mt-2" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#ec1313] uppercase tracking-widest mb-0.5">Welcome Back</p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tighter">
              {userName}
            </h1>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Stats Grid */}
      <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mb-4 sm:mb-6">At a Glance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">

        {/* Stat Card 1 */}
        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-6 hover:shadow-md transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-[#ec1313] rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaHeart size={22} />
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{summary.favoriteCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Saved Items</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-6 hover:shadow-md transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaCartPlus size={22} />
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{summary.validCartItemCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">In Cart</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-6 hover:shadow-md transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaBoxOpen size={22} />
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{summary.outOfStockCartItemCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Out of Stock</p>
          </div>
        </div>

      </div>

      {/* Placeholder for Recent Orders widget later */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm mt-8 hidden sm:block">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Recent Activity</h2>
        <p className="text-sm text-slate-500 font-medium">Your recent orders and account updates will appear here.</p>
      </div>

    </UserDashboardShell>
  );
}