"use client";

import React, { useState, useEffect } from "react";
import { FaChartBar, FaDollarSign, FaShoppingBag, FaBoxOpen, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/reports")
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => toast.error("Failed to load reports"));
    }, []);

    const fetchReports = () => {
        setLoading(true);
        fetch("/api/admin/reports")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
                toast.success("Data refreshed!"); // Visual confirmation
            })
            .catch(() => {
                toast.error("Failed to refresh");
                setLoading(false);
            });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>;

    const kpiCards = [
        { title: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: <FaDollarSign />, color: "bg-green-50 text-green-600 border-green-100" },
        { title: "Total Orders", value: stats.totalOrders, icon: <FaShoppingBag />, color: "bg-blue-50 text-blue-600 border-blue-100" },
        { title: "Paid Orders", value: stats.paidOrders, icon: <FaChartBar />, color: "bg-purple-50 text-purple-600 border-purple-100" },
        { title: "Items in Stock", value: stats.inventory?.totalItemsInStock || 0, icon: <FaBoxOpen />, color: "bg-orange-50 text-orange-600 border-orange-100" },
    ];

    return (
        <div className="p-8 bg-[#f8f9fa] min-h-screen text-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <FaChartBar className="text-[#ec1313] text-3xl" />
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight">Financial Reports</h1>
                            <p className="text-slate-500 font-medium text-sm mt-1">Live analytics and store performance metrics.</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchReports}
                        className="text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <span className="cursor-pointer">Refresh Data</span>
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {kpiCards.map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border ${card.color}`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Placeholder for future Charts */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FaChartBar className="text-slate-300 text-2xl" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Advanced Charts Coming Soon</h3>
                    <p className="text-slate-500 text-sm font-medium text-center max-w-sm">
                        Historical data charts and visual revenue breakdowns will be unlocked as your store gathers more order data.
                    </p>
                </div>
            </div>
        </div>
    );
}