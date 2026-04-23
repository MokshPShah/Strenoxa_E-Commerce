import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import UserDashboardShell from "@/components/UserDashboardShell";
import Link from "next/link";

export default async function UserOrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) redirect("/login");

    await connectDB();

    // 1. FIX: Fetch the user securely by email to prevent the CastError
    const dbUser = await User.findOne({ email: session.user.email }).select("_id");
    if (!dbUser) redirect("/login");

    // 2. Fetch the orders using the secure MongoDB _id
    const orders = await Order.find({ user: dbUser._id })
        .sort({ createdAt: -1 })
        .lean();

    // Helper function for dynamic status colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-[#ec1313]';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <UserDashboardShell>
            <h1 className="text-3xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter">
                Order <span className="text-[#ec1313]">History</span>
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
                    <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
                    <Link href="/shop" className="text-[#ec1313] font-bold mt-4 inline-block hover:underline cursor-pointer">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order: any) => (
                        <div key={order._id.toString()} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-200 transition-colors">
                            
                            <div className="w-full md:w-auto text-center md:text-left">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Order #{order._id.toString().slice(-6).toUpperCase()}
                                </p>
                                <p className="font-bold text-slate-900 mt-1">
                                    {order.items.length} Items • ${(order.totalAmount || 0).toFixed(2)}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                    {order.status || 'Processing'}
                                </span>
                                
                                {/* 3. FIX: Wired up the actual link to the Invoice page we just built */}
                                <Link 
                                    href={`/dashboard/orders/${order._id.toString()}`}
                                    className="text-sm font-bold text-white bg-slate-900 hover:bg-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer active:scale-95"
                                >
                                    View Details
                                </Link>
                            </div>
                            
                        </div>
                    ))}
                </div>
            )}
        </UserDashboardShell>
    );
}