import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

async function verifyAdmin() {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role

    if (!session || (role !== 'admin' && role !== 'super admin')) {
        return false;
    }
    return true;
}

// GET all coupons
export async function GET() {
    try {
        await connectDB();
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch coupons" }, { status: 500 });
    }
}

// POST a new coupon
export async function POST(req: Request) {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        body.code = body.code.toUpperCase();

        const existing = await Coupon.findOne({ code: body.code });
        if (existing) return NextResponse.json({ message: "Coupon code already exists" }, { status: 400 });

        const newCoupon = await Coupon.create(body);
        return NextResponse.json({ message: "Coupon created", coupon: newCoupon }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}