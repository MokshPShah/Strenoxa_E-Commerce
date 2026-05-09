"use client";

import React, { useState, useEffect } from "react";
import { FaCog, FaSave, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

export default function SiteSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => { setSettings(data); setLoading(false); })
            .catch(() => toast.error("Failed to load settings"));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) toast.success("Settings updated globally");
            else toast.error("Failed to save settings");
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>;

    return (
        <div className="p-8 bg-[#f8f9fa] min-h-screen text-slate-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <FaCog className="text-[#ec1313] text-3xl" />
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Site Settings</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage global e-commerce parameters and rules.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* General Settings */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-6 border-b border-slate-100 pb-4">General Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Store Name</label>
                                {/* Added || "" fallback */}
                                <input type="text" value={settings.storeName || ""} onChange={e => setSettings({ ...settings, storeName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-400 cursor-text" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Support Email</label>
                                {/* Added || "" fallback */}
                                <input type="email" value={settings.contactEmail || ""} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-400 cursor-text" />
                            </div>
                        </div>
                    </div>

                    {/* E-Commerce Rules */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-6 border-b border-slate-100 pb-4">E-Commerce Rules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Free Shipping Threshold ($)</label>
                                {/* Added || 0 fallback */}
                                <input type="number" min="0" value={settings.freeShippingThreshold || 0} onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-400 cursor-text" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Standard Shipping Fee ($)</label>
                                {/* Added || 0 fallback */}
                                <input type="number" min="0" value={settings.standardShippingFee || 0} onChange={e => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-400 cursor-text" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Global Tax Rate (%)</label>
                                {/* Added || 0 fallback */}
                                <input type="number" min="0" step="0.1" value={settings.taxRate || 0} onChange={e => setSettings({ ...settings, taxRate: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-400 cursor-text" />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#ec1313]"></div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-[#ec1313] mb-2">Maintenance Mode</h2>
                        <p className="text-slate-500 text-sm mb-6 font-medium">When active, the store will be locked for customers. Use during major updates.</p>

                        <label className="flex items-center gap-3 cursor-pointer">
                            {/* FIXED: Added || false fallback to prevent the uncontrolled input error */}
                            <input type="checkbox" checked={settings.maintenanceMode || false} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} className="w-6 h-6 accent-[#ec1313] cursor-pointer" />
                            <span className="font-bold text-slate-900 cursor-pointer">Enable Maintenance Mode</span>
                        </label>
                    </div>

                    <button type="submit" disabled={saving} className="w-full bg-slate-950 hover:bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors cursor-pointer flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                        {saving ? <FaSpinner className="animate-spin cursor-pointer" /> : <FaSave className="cursor-pointer" />}
                        <span className="cursor-pointer">{saving ? "Saving..." : "Save All Settings"}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}