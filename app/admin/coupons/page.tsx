"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTicketAlt, FaSpinner, FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: "0",
        isNewUserOnly: false,
        expiryDate: "",
        isActive: true,
        description: ""
    });

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleOpenModal = (coupon: any = null) => {
        if (coupon) {
            setEditingId(coupon._id);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                minOrderAmount: coupon.minOrderAmount.toString(),
                isNewUserOnly: coupon.isNewUserOnly,
                expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
                isActive: coupon.isActive,
                description: coupon.description || ""
            });
        } else {
            setEditingId(null);
            setFormData({
                code: "", discountType: "percentage", discountValue: "",
                minOrderAmount: "0", isNewUserOnly: false, expiryDate: "",
                isActive: true, description: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    discountValue: Number(formData.discountValue),
                    minOrderAmount: Number(formData.minOrderAmount)
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setIsModalOpen(false);
                fetchCoupons();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Coupon deleted");
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success(`Coupon ${!currentStatus ? 'Activated' : 'Deactivated'}`);
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>;

    return (
        <div className="p-8 bg-[#f8f9fa] min-h-screen text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                            <FaTicketAlt className="text-[#ec1313]" /> Promo Codes
                        </h1>
                        <p className="text-slate-500 font-medium mt-1 text-sm">Create and manage discount codes for your customers.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-slate-950 hover:bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                    >
                        <FaPlus className="cursor-pointer" /> <span className="cursor-pointer">Add Coupon</span>
                    </button>
                </div>

                {/* Coupons Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400 font-black">
                                    <th className="p-5">Code</th>
                                    <th className="p-5">Discount</th>
                                    <th className="p-5">Rules</th>
                                    <th className="p-5">Expiry</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium text-slate-600">
                                {coupons.map((coupon) => {
                                    const isExpired = new Date() > new Date(coupon.expiryDate);
                                    return (
                                        <tr key={coupon._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5">
                                                <span className="font-black text-slate-900 text-base">{coupon.code}</span>
                                                <p className="text-xs text-slate-400 mt-1">{coupon.description}</p>
                                            </td>
                                            <td className="p-5 font-bold text-slate-900">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                                            </td>
                                            <td className="p-5 space-y-1 text-xs">
                                                <p>Min Spend: <span className="font-bold text-slate-900">${coupon.minOrderAmount}</span></p>
                                                {coupon.isNewUserOnly && (
                                                    <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px]">New Users Only</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <span className={isExpired ? "text-[#ec1313] font-bold flex items-center gap-1" : ""}>
                                                    {isExpired && <FaExclamationCircle />}
                                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <button
                                                    onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${coupon.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                >
                                                    <span className="cursor-pointer">{coupon.isActive ? "Active" : "Disabled"}</span>
                                                </button>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => handleOpenModal(coupon)} className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-2">
                                                        <FaEdit size={16} className="cursor-pointer" />
                                                    </button>
                                                    <button onClick={() => handleDelete(coupon._id)} className="text-slate-400 hover:text-[#ec1313] transition-colors cursor-pointer p-2">
                                                        <FaTrash size={16} className="cursor-pointer" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">No coupons found. Create one to run a promotion!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Form Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-[#ec1313] cursor-pointer">
                                <FaTimes size={20} className="cursor-pointer" />
                            </button>

                            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
                                {editingId ? "Edit Coupon" : "Create Coupon"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Coupon Code</label>
                                    <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-900 uppercase focus:outline-none focus:border-slate-400 cursor-text" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Type</label>
                                        <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-pointer">
                                            <option value="percentage" className="cursor-pointer">Percentage (%)</option>
                                            <option value="fixed" className="cursor-pointer">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Value</label>
                                        <input required type="number" min="1" step="any" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} placeholder="e.g. 10" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-text" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Min Spend ($)</label>
                                        <input type="number" min="0" value={formData.minOrderAmount} onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-text" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expiry Date</label>
                                        <input required type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-text" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Internal Description (Optional)</label>
                                    <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Influencer campaign code" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none cursor-text" />
                                </div>

                                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input type="checkbox" checked={formData.isNewUserOnly} onChange={e => setFormData({ ...formData, isNewUserOnly: e.target.checked })} className="w-5 h-5 accent-[#ec1313] cursor-pointer" />
                                    <div>
                                        <span className="block text-sm font-black text-slate-900 uppercase cursor-pointer">New Customers Only</span>
                                        <span className="block text-xs text-slate-500 font-medium cursor-pointer">Only applies if user has 0 previous orders.</span>
                                    </div>
                                </label>

                                <button type="submit" className="w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm mt-4 transition-colors cursor-pointer shadow-md">
                                    <span className="cursor-pointer">{editingId ? "Save Changes" : "Create Coupon"}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}