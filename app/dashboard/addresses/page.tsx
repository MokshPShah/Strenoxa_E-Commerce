"use client";

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import UserDashboardShell from "@/components/UserDashboardShell";
import toast from "react-hot-toast";

interface Address {
    _id: string;
    title: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
}

export default function AddressPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // NEW: State to track if we are editing an existing address
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '', street: '', city: '', state: '', zip: '', country: '', isDefault: false,
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses');
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            const sortedAddresses = (data.addresses || []).sort((a: Address, b: Address) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
            setAddresses(sortedAddresses);
        } catch (error) {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // NEW: Populate the form when the user clicks "Edit"
    const handleEdit = (address: Address) => {
        setEditingId(address._id);
        setFormData({
            title: address.title,
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country,
            isDefault: address.isDefault,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
    };

    // NEW: Cancel button resets everything
    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', street: '', city: '', state: '', zip: '', country: '', isDefault: false });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Check if we are Updating (PUT) or Creating (POST)
        const method = editingId ? 'PUT' : 'POST';
        const payload = editingId ? { ...formData, addressId: editingId } : formData;

        try {
            const res = await fetch('/api/user/addresses', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success(editingId ? "Address updated!" : "Address saved successfully!");
            handleCancel(); // Reset form and close it
            fetchAddresses(); // Refresh data
        } catch (error) {
            toast.error("Failed to save address");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Address removed");
            setAddresses(addresses.filter((addr) => addr._id !== id));
        } catch (error) {
            toast.error("Failed to delete address");
        }
    };

    return (
        <UserDashboardShell>
            <div className="font-sans text-slate-800 pb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">My Addresses</h1>
                    <button
                        onClick={showForm ? handleCancel : () => setShowForm(true)}
                        className="bg-slate-950 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                    >
                        {showForm ? 'Cancel' : '+ Add New Address'}
                    </button>
                </div>

                {/* Dynamic Form (Handles both Add & Edit) */}
                {showForm && (
                    <form onSubmit={handleSaveAddress} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 transition-all">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6">
                            {editingId ? "Edit Location" : "Add a New Location"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" name="title" placeholder="Label (e.g., Home, Work)" value={formData.title} onChange={handleInputChange} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] outline-none" required />
                            <input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleInputChange} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] outline-none" required />
                            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] outline-none" required />

                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="state" placeholder="State/Province" value={formData.state} onChange={handleInputChange} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] outline-none" required />
                                <input type="text" name="zip" placeholder="Zip/Postal Code" value={formData.zip} onChange={handleInputChange} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] outline-none" required />
                            </div>

                            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] outline-none md:col-span-2" required />

                            <label className="flex items-center space-x-3 cursor-pointer md:col-span-2 p-2 w-fit">
                                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-5 h-5 accent-[#ec1313] cursor-pointer" />
                                <span className="text-sm font-bold text-slate-700">Set as my default shipping address</span>
                            </label>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSaving} className="bg-[#ec1313] hover:bg-[#c40f0f] text-white px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50">
                                {isSaving ? "Saving..." : (editingId ? "Update Address" : "Save Address")}
                            </button>
                        </div>
                    </form>
                )}

                {/* Loading & Grid Section */}
                {loading ? (
                    <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">No addresses saved</h2>
                        <p className="text-slate-500 font-medium">Add a location to make checkout faster.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                            <div key={addr._id} className={`p-6 sm:p-8 rounded-3xl border-2 relative transition-all shadow-sm ${addr.isDefault ? 'border-[#ec1313] bg-red-50/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                {addr.isDefault && <span className="absolute top-6 right-6 bg-red-50 text-[#ec1313] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Default</span>}

                                <h3 className="text-lg font-black uppercase tracking-tight mb-4 pr-20">{addr.title}</h3>
                                <div className="text-sm text-slate-600 font-medium space-y-1 mb-8">
                                    <p>{addr.street}</p>
                                    <p>{addr.city}, {addr.state} {addr.zip}</p>
                                    <p className="font-bold text-slate-900">{addr.country}</p>
                                </div>

                                {/* NEW: Edit and Delete Buttons */}
                                <div className="flex gap-3 border-t border-slate-100 pt-6">
                                    <button onClick={() => handleEdit(addr)} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                                        <FaEdit /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(addr._id)} className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </UserDashboardShell>
    );
}