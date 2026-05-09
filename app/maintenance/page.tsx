import { FaTools } from "react-icons/fa";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-[#ec1313]/10 text-[#ec1313] rounded-full flex items-center justify-center mb-8 border border-[#ec1313]/20 shadow-[0_0_50px_rgba(236,19,19,0.2)]">
                <FaTools size={40} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
                We're upgrading <span className="text-[#ec1313]">the vault.</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-md mx-auto text-lg">
                Strenoxa is currently undergoing scheduled maintenance to bring you new gear and a better experience. We'll be back online shortly.
            </p>
        </div>
    );
}