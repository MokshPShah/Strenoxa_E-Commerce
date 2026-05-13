"use client";

import { useEffect, useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaSpinner } from "react-icons/fa";

export default function ContactPage() {
    const [supportEmail, setSupportEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSupportEmail(data.contactEmail || "support@strenoxa.com");
                }
            } catch (error) {
                console.error("Failed to fetch settings");
                setSupportEmail("support@strenoxa.com");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-[#ec1313] text-4xl" /></div>;

    return (
        <div className="min-h-screen bg-white pb-24 pt-35">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-tight mb-4">
                        Get In <span className="text-[#ec1313]">Touch</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-slate-700 tracking-tighter leading-relaxed max-w-2xl">
                        Have a question about an order, a product, or your account? We are here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT: Contact Information */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-start gap-6">
                            <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-[#ec1313] flex-shrink-0">
                                <FaEnvelope size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">Email Support</h3>
                                <a href={`mailto:${supportEmail}`} className="text-slate-600 font-medium hover:text-[#ec1313] transition-colors text-lg">
                                    {supportEmail}
                                </a>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-start gap-6">
                            <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-[#ec1313] flex-shrink-0">
                                <FaMapMarkerAlt size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">Headquarters</h3>
                                <p className="text-slate-600 font-medium text-lg">123 Fitness Ave, Suite 400<br />New York, NY 10001</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-start gap-6">
                            <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-[#ec1313] flex-shrink-0">
                                <FaPhone size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">Call Us</h3>
                                <p className="text-slate-600 font-medium text-lg">1-800-STRENOXA</p>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Mon-Fri: 9am - 5pm EST</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Quick Contact Form */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl border-4 border-slate-950 shadow-xl">
                        <h2 className="text-3xl font-black text-slate-950 border-b-8 border-[#ec1313] pb-2 mb-8 inline-block">Send a Message</h2>

                        <form action={`mailto:${supportEmail}`} method="post" encType="text/plain" className="flex flex-col gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                                <input type="text" name="name" required className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl px-4 py-4 focus:outline-none focus:border-slate-300 font-medium transition-colors" placeholder="John Doe" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Order Number (Optional)</label>
                                <input type="text" name="order" className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl px-4 py-4 focus:outline-none focus:border-slate-300 font-medium transition-colors" placeholder="#123456" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Message</label>
                                <textarea name="message" required rows={5} className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl px-4 py-4 focus:outline-none focus:border-slate-300 font-medium transition-colors resize-none" placeholder="How can we help you?"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white h-14 rounded-xl font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-3 cursor-pointer mt-4">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}