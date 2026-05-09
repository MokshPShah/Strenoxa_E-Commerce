export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'

// --- GET: Fetch all orders for the admin table ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'super admin')) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const orders = await Order.find()
      .populate({ path: 'user', select: 'name email', model: User })
      .populate('items.productId', 'image')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

// --- PATCH: Update order status & payment ---
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (userRole !== 'admin' && userRole !== 'super admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    // Safely parse the body
    const body = await req.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      console.error("ADMIN PATCH ERROR: Missing orderId. Received payload:", body);
      return NextResponse.json({ message: `Missing Order ID. Received: ${JSON.stringify(body)}` }, { status: 400 })
    }

    await connectDB()
    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    // 1. Update Delivery Status (if provided)
    if (status) {
      order.status = status;
      // Automated COD logic: Only auto-pay if a manual payment status isn't also being sent
      if (status === 'Delivered' && order.paymentMethod === 'cod' && !paymentStatus) {
        order.paymentStatus = 'Paid';
      }
    }

    // 2. Update Payment Status Manually (if provided)
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save()

    return NextResponse.json({ message: 'Order updated', order: order })
  } catch (error) {
    console.error('Order Update Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}