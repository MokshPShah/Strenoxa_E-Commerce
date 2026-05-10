import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import Product from '@/models/Product'
import ActivityLog from '@/models/ActivityLog'
import Coupon from '@/models/Coupon' // Added for Promo Codes
import Settings from '@/models/Settings' // Added for Global Math Rules
import crypto from 'crypto'
import { sendOrderConfirmationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'You must be logged in to checkout' },
        { status: 401 }
      )
    }

    // Extracted couponCode alongside the existing fields
    const {
      shippingAddress,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      couponCode // Pass this from your checkout frontend
    } = await req.json()

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

    // Fetch Global Site Settings (Fallback to defaults if somehow missing)
    const settings = await Settings.findOne() || { 
        freeShippingThreshold: 100, 
        standardShippingFee: 10, 
        taxRate: 8 
    };

    // 2. Fetch the true cart directly from the database
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

    // 4. Secure Server-Side Coupon Verification
    let discountAmount = 0;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      
      if (coupon) {
        const now = new Date();
        const expiryDate = new Date(coupon.expiryDate);
        expiryDate.setUTCHours(23, 59, 59, 999);

        // Verify Expiry, Min Amount, and New User Status on the server
        let isEligible = true;
        if (now > expiryDate) isEligible = false;
        if (subTotal < coupon.minOrderAmount) isEligible = false;
        
        if (coupon.isNewUserOnly) {
          const orderCount = await Order.countDocuments({ 
             user: user._id, 
             status: { $ne: 'Cancelled' } 
          });
          if (orderCount > 0) isEligible = false;
        }

        if (isEligible) {
          discountAmount = coupon.discountType === 'percentage' 
              ? (subTotal * coupon.discountValue) / 100 
              : coupon.discountValue;
        }
      }
    }

    // 5. Apply Dynamic Math Rules
    const shippingFee = subTotal > settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const discountedSubtotal = Math.max(0, subTotal - discountAmount); // Ensure it never drops below $0
    const tax = discountedSubtotal * (settings.taxRate / 100);
    const finalTotalAmount = discountedSubtotal + shippingFee + tax;

    // If Razorpay is the chosen payment method, verify the payment details
    let finalPaymentStatus = 'Pending'

    if (paymentMethod === 'razorpay') {
      const secret = process.env.RAZORPAY_KEY_SECRET
      if (!secret || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        console.error("CRITICAL: something is missing for the payment.");
        return NextResponse.json({ message: "Server configuration error. Please contact support." }, { status: 500 })
      }

      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if(generatedSignature !== razorpaySignature){
        console.warn(`Payment verification failed for user ${user.email}. Possible tampering detected.`)
        return NextResponse.json({message: "Payment verification failed. Please try again or contact support."}, {status: 400})
      }

      finalPaymentStatus = 'Paid'
    }

    // 6. Create the Order
    const newOrder = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
      appliedCoupon: couponCode?couponCode.toUpperCase():null,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      shippingFee: parseFloat(shippingFee.toFixed(2)),
      taxAmount: parseFloat(tax.toFixed(2)),
      status: 'Processing',
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : finalPaymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })

    // 7. Deduct Inventory Stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      })
    }

    // 8. Securely Clear User Cart
    user.cart = []
    await user.save()

    // 9. Log the Activity for Super Admins
    await ActivityLog.create({
      userEmail: user.email,
      action: 'New Order Placed',
      details: `Order #${newOrder._id
        .toString()
        .slice(-8)
        .toUpperCase()} for $${finalTotalAmount.toFixed(2)}`
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