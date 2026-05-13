import Link from "next/link";
import { FaShieldAlt, FaDumbbell, FaLeaf } from "react-icons/fa";

export const metadata = {
    title: "About Us | Strenoxa",
    description: "Learn more about Strenoxa and our mission.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white pb-24 pt-35">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                <div className="mb-24 max-w-4xl">
                    <h1 className="text-4xl md:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-tight mb-6">
                        Fueling The <span className="text-[#ec1313]">Relentless</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-slate-700 tracking-tighter leading-relaxed mb-6">
                        Strenoxa wasn't built in a boardroom. It was forged in the iron, born out of a frustration with under-dosed, over-hyped supplements that promise the world and deliver nothing.
                    </p>
                    <p className="text-lg md:text-xl font-medium text-slate-500 tracking-tighter leading-relaxed">
                        We believe in absolute transparency. What is on the label is exactly what is in the bottle. No proprietary blends, no hidden fillers. Just clinical doses of scientifically backed ingredients designed to push your limits.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#ec1313] mb-8 border border-slate-200">
                            <FaShieldAlt size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">Absolute Purity</h3>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed">Every batch is third-party tested to guarantee purity, potency, and safety.</p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#ec1313] mb-8 border border-slate-200">
                            <FaDumbbell size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">Formulated to Perform</h3>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed">Designed for athletes who demand more. Whether chasing a PR or just starting out.</p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#ec1313] mb-8 border border-slate-200">
                            <FaLeaf size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">Clean Ingredients</h3>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed">Sourced from the highest quality raw materials and manufactured in cGMP facilities.</p>
                    </div>
                </div>

                <div className="bg-slate-950 rounded-3xl p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 border-b-8 border-[#ec1313]">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Ready to level up?</h2>
                        <p className="text-slate-400 text-xl font-medium">Experience the Strenoxa difference today and see why athletes have made the switch.</p>
                    </div>
                    <Link href="/shop" className="bg-[#ec1313] hover:bg-[#c40f0f] text-white px-10 h-16 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer text-lg">
                        Shop All Products
                    </Link>
                </div>

            </div>
        </div>
    );
}