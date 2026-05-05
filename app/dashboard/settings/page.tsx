"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FaCog, FaUser, FaLock, FaEnvelope, FaBell, FaExclamationTriangle } from "react-icons/fa";
import UserDashboardShell from "@/components/UserDashboardShell";
import toast from "react-hot-toast";

export default function DashboardSettingsPage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState(session?.user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateProfile', name }),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            await update({ name }); // Update NextAuth session
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Error updating profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return toast.error("Please fill all password fields");
        setIsSavingPassword(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updatePassword', currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you absolutely sure you want to delete your account? This cannot be undone.")) {
            toast.success("Account deletion request submitted to support.");
            // Actual deletion logic would go here
        }
    };

    return (
        <UserDashboardShell>
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    <FaCog className="text-[#ec1313]" /> Settings
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Update your account details, security, and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 border-b border-slate-100 pb-4">Profile Details</h2>
                    <form className="space-y-5" onSubmit={handleUpdateProfile}>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ec1313]/20 focus:border-[#ec1313] transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="email"
                                    value={session?.user?.email || ""}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <button disabled={isSavingProfile} className="cursor-pointer w-full bg-slate-950 hover:bg-black text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-4 shadow-md disabled:opacity-50">
                            {isSavingProfile ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 border-b border-slate-100 pb-4">Security</h2>
                    <form className="space-y-5" onSubmit={handleUpdatePassword}>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Create new password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                                />
                            </div>
                        </div>
                        <button disabled={isSavingPassword} className="cursor-pointer w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-4 shadow-lg shadow-red-500/20 disabled:opacity-50">
                            {isSavingPassword ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-100 shadow-sm lg:col-span-2 mt-4">
                    <h2 className="text-lg font-black text-red-600 uppercase tracking-tight mb-2 flex items-center gap-2">
                        <FaExclamationTriangle /> Danger Zone
                    </h2>
                    <p className="text-sm text-slate-600 font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                    <button onClick={handleDeleteAccount} className="cursor-pointer bg-white border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]">
                        Delete Account
                    </button>
                </div>

            </div>
        </UserDashboardShell>
    );
}