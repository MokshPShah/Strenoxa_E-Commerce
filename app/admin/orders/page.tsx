import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import OrderTable from "./OrderTable";
import { FaBox } from "react-icons/fa";

// Ensure the page always fetches fresh data from the database
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    await connectDB();

    // 1. Fetch the orders and append .lean() at the very end
    const rawOrders = await Order.find()
        .populate({ path: 'user', select: 'name email', model: User })
        .populate('items.productId', 'image')
        .sort({ createdAt: -1 })
        .lean(); // <--- Forces Mongoose to return a plain, lightweight object

    // 2. The Bulletproof Next.js Boundary Fix
    // This absolutely guarantees all nested arrays (items) and objects (addresses) are serialized correctly
    const cleanOrders = JSON.parse(JSON.stringify(rawOrders));

    return (
        <div className="p-8 bg-[#f8f9fa] min-h-screen text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <FaBox className="text-[#ec1313] text-3xl" />
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Order Management</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">View details, fulfill shipments, and track payments.</p>
                    </div>
                </div>

                {/* Pass the fully cleaned data to your Client Component */}
                <OrderTable initialOrders={cleanOrders} />

            </div>
        </div>
    );
}