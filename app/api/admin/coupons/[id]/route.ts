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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }
        const { id } = await params;
        await connectDB();
        const body = await req.json();
        if (body.code) body.code = body.code.toUpperCase();

        const updated = await Coupon.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ message: "Coupon updated", coupon: updated });
    } catch (error) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }
        const { id } = await params;
        await connectDB();
        await Coupon.findByIdAndDelete(id);
        return NextResponse.json({ message: "Coupon deleted" });
    } catch (error) {
        return NextResponse.json({ message: "Delete failed" }, { status: 500 });
    }
}