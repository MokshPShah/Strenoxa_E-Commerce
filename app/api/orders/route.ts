import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import Product from '@/models/Product'
import ActivityLog from '@/models/ActivityLog'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'You must br logged in to checkout' },
        { status: 401 }
      )
    }
    const { shippingAddress } = await req.json()

    // 1. Strict Address Validation
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      return NextResponse.json(
        { message: 'A complete shipping address is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // 2. Fetch the true cart directly from the database, ignoring frontend prices
    const user = await User.findOne({ email: session.user.email }).populate(
      'cart.productId'
    )

    if (!user || !user.cart || user.cart.length === 0) {
      return NextResponse.json(
        { message: 'Your cart is empty' },
        { status: 400 }
      )
    }

    let subTotal = 0
    const orderItems = []

    // 3. Verify stock and calculate exact server-side pricing
    for (const cartItem of user.cart) {
      const product = cartItem.productId

      if (!product || product.isDeleted) {
        return NextResponse.json(
          { message: 'A product in your cart is no longer in stock' },
          { status: 400 }
        )
      }

      if (product.stock < cartItem.quantity) {
        return NextResponse.json(
          {
            message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`
          },
          { status: 400 }
        )
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        flavor: cartItem.flavor || "Standard"
      })

      subTotal += product.price * cartItem.quantity
    }

    const shippingFee = subTotal > 100 ? 0 : 10;
    const finalTotalAmount = subTotal + shippingFee;

    // 4. Create the Order
    const newOrder = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
      status: 'Processing',
      shippingAddress
    })

    // 5. Deduct Inventory Stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      })
    }

    // 6. Securely Clear User Cart
    user.cart = []
    await user.save()

    // 7. Log the Activity for Super Admins
    await ActivityLog.create({
      userEmail: user.email,
      action: 'New Order Placed',
      details: `Order #${newOrder._id
        .toString()
        .slice(-8)
        .toUpperCase()} for $${subTotal.toFixed(2)}`
    })

    return NextResponse.json(
      {
        message: 'Order placed successfully!',
        orderId: newOrder._id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Checkout Error:', error)
    return NextResponse.json(
      { message: 'Internal server error during checkout' },
      { status: 500 }
    )
  }
}
