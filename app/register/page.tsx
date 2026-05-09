"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaUser, FaGoogle, FaFacebook } from "react-icons/fa";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Account created! Welcome to Strenoxa.");
                // Automatically log them in after registration
                const loginRes = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (loginRes?.error) {
                    router.push("/login");
                } else {
                    router.push("/");
                    router.refresh();
                    window.location.reload();
                }
            } else {
                toast.error(data.message || "Registration failed");
                setIsLoading(false);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white pt-24">
            {/* Left Side: Visual Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-950">
                <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop"
                    alt="Training Hard"
                    fill
                    className="object-cover opacity-50 mix-blend-luminosity"
                    priority
                />
                <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply z-10"></div>
                <div className="absolute bottom-20 left-16 z-20 max-w-lg">
                    <span className="bg-[#ec1313] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm mb-4 inline-block">
                        Join The Elite
                    </span>
                    <h1 className="text-6xl font-black text-white italic tracking-tighter leading-tight mb-4 uppercase">
                        Build Your <br /><span className="text-[#ec1313]">Legacy</span>
                    </h1>
                    <p className="text-slate-300 font-medium text-lg leading-relaxed">
                        Create an account to unlock exclusive athlete pricing and track your performance journey with Strenoxa.
                    </p>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-slate-100">

                    <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-2 text-center lg:text-left">Create Account</h2>
                    <p className="text-slate-500 font-medium mb-8 text-center lg:text-left">Join the Strenoxa community today.</p>

                    {/* Social Registration */}
                    <div className="flex gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="flex-grow flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-sm font-bold text-slate-700"
                        >
                            <FaGoogle className="text-red-500" /> Google
                        </button>
                        <button
                            type="button"
                            onClick={() => signIn("facebook", { callbackUrl: "/" })}
                            className="flex-grow flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-sm font-bold text-slate-700"
                        >
                            <FaFacebook className="text-blue-600" /> Facebook
                        </button>
                    </div>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-grow h-px bg-slate-200"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[10px]">Or Register with Email</span>
                        <div className="flex-grow h-px bg-slate-200"></div>
                    </div>

                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        {/* Name Input */}
                        <div>
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FaUser size={14} /></div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FaEnvelope size={14} /></div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FaLock size={14} /></div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl font-bold tracking-wide text-lg transition-all duration-300 shadow-xl shadow-red-500/20 active:scale-[0.98] mt-4 cursor-pointer disabled:opacity-50"
                        >
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-sm font-medium text-slate-500 mt-8">
                        Already have an account? <Link href="/login" className="text-[#ec1313] font-bold cursor-pointer hover:underline">Sign in</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}