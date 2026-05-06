import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const order = await Order.findOne({ id: params.id }).populate("items.productId")
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if(order.userEmail !== session.user.email){
            return NextResponse.json({error: "Unauthorized access to this order"}, {status: 403})
        }

        return NextResponse.json({order})
    } catch (error) {
        return NextResponse.json({error: "Failed to fetch order details"}, {status: 500})
    }
}