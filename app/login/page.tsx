"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await signIn("credentials", {
            redirect: true,
            callbackUrl: '/',
            email,
            password,
        });

        if (res?.error) {
            toast.error("Invalid email or password");
            setIsLoading(false);
        } else {
            toast.success("Successfully logged in!");
            await getSession();
            router.push("/");
            router.refresh();
        }
    };

    if (status === "loading") return null;

    return (
        <div className="min-h-screen flex bg-white pt-24">
            <div className="hidden lg:flex w-1/2 relative bg-slate-950">
                <Image
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1400&auto=format&fit=crop"
                    alt="Gym Atmosphere"
                    fill
                    className="object-cover opacity-50 mix-blend-luminosity"
                    priority
                />
                <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply z-10"></div>
                <div className="absolute bottom-20 left-16 z-20 max-w-lg">
                    <span className="bg-[#ec1313] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm mb-4 inline-block">
                        Elite Performance
                    </span>
                    <h1 className="text-6xl font-black text-white italic tracking-tighter leading-tight mb-4 uppercase">
                        Fuel Your <br /><span className="text-[#ec1313]">Ambition</span>
                    </h1>
                    <p className="text-slate-300 font-medium text-lg leading-relaxed">
                        Access your personalized supplement stacks and track your fitness goals with the Strenoxa community.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-slate-100">

                    <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-500 font-medium mb-8">Please enter your details to sign in.</p>

                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div>
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FaEnvelope /></div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest block">Password</label>
                                <Link href="#" className="text-xs font-bold text-[#ec1313] hover:underline cursor-pointer">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FaLock /></div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all"
                                />
                            </div>
                        </div>

                        <button disabled={isLoading} type="submit" className="w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl font-bold tracking-wide text-lg transition-all duration-300 shadow-xl shadow-red-500/20 active:scale-[0.98] mt-4 cursor-pointer disabled:opacity-50">
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-grow h-px bg-slate-200"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or Continue With</span>
                        <div className="flex-grow h-px bg-slate-200"></div>
                    </div>

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

                    <p className="text-center text-sm font-medium text-slate-500">
                        Don't have an account? <Link href="/register" className="text-[#ec1313] font-bold cursor-pointer hover:underline">Sign up for free</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}