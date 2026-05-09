export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    return session && (role === 'admin' || role === 'super admin');
}

export async function GET() {
    try {
        if (!await verifyAdmin()) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        await connectDB();

        // 1. Calculate Total Revenue (FIXED: "Paid" and "$totalAmount")
        const revenueAggregation = await Order.aggregate([
            { $match: { paymentStatus: "Paid", status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
        const paidOrdersCount = revenueAggregation[0]?.count || 0;

        // 2. Total Orders
        const totalOrdersCount = await Order.countDocuments();

        // 3. Inventory Stats (FIXED: "totalItemsInStock")
        // Also added a safe fallback check in case isDeleted is undefined on older products
        const inventoryStats = await Product.aggregate([
            { $match: { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] } },
            { $group: { _id: null, totalItemsInStock: { $sum: "$stock" }, uniqueProducts: { $sum: 1 } } }
        ]);

        // 4. Low Stock Alerts (Products with less than 15 stock)
        const lowStockProducts = await Product.find({
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
            stock: { $lt: 15 }
        }).select('name stock price').limit(6).lean();

        // 5. Recent Orders Feed
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id totalAmount paymentMethod paymentStatus status createdAt')
            .lean();

        return NextResponse.json({
            revenue: totalRevenue,
            paidOrders: paidOrdersCount,
            totalOrders: totalOrdersCount,
            inventory: inventoryStats[0] || { totalItemsInStock: 0, uniqueProducts: 0 },
            lowStock: lowStockProducts,
            recentOrders: recentOrders
        });

    } catch (error) {
        console.error("Reports API Error:", error);
        return NextResponse.json({ message: "Failed to generate report" }, { status: 500 });
    }
}