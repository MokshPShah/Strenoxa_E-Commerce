import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "You must be logged in to initialize payment" },
                { status: 401 }
            );
        }
        const { amount } = await req.json()

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { message: "Invalid amount" },
                { status: 400 }
            );
        }

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay keys are missing from environment variables.");
            return NextResponse.json(
                { message: "Server configuration error" },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const options = {
            amount: Math.round(amount * 100),
            currency: "USD",
            receipt: `receipt_order_${Date.now()}`
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json(order, { status: 200 })
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        return NextResponse.json(
            { message: "Failed to initialize payment gateway" },
            { status: 500 }
        );
    }
}