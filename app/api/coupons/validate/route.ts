import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Login to use coupons" }, { status: 401 });

        const { code, subtotal } = await req.json();
        await connectDB();

        // 1. Check if coupon exists and is active
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

        if (!coupon) {
            return NextResponse.json({ message: "Invalid coupon code." }, { status: 404 });
        }

        // 2. Check Expiry
        const now = new Date();
        const expiryDate = new Date(coupon.expiryDate);
        // Set expiry to the very last millisecond of that day to prevent timezone bugs
        expiryDate.setUTCHours(23, 59, 59, 999);

        if (now > expiryDate) {
            return NextResponse.json({ message: "This coupon code has expired." }, { status: 400 });
        }

        // 3. Check Minimum Amount
        if (subtotal < coupon.minOrderAmount) {
            return NextResponse.json({ message: `Min order for this coupon is $${coupon.minOrderAmount}` }, { status: 400 });
        }

        // 4. Handle "New Customer Only" Logic
        if (coupon.isNewUserOnly) {
            const orderCount = await Order.countDocuments({
                user: (session.user as any).id,
                status: { $ne: 'Cancelled' }
            });

            if (orderCount > 0) {
                return NextResponse.json({ message: "This coupon is only for your first order." }, { status: 403 });
            }
        }

        return NextResponse.json({
            valid: true,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}