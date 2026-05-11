import mongoose, { Schema, models } from 'mongoose'

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        flavor: {
          type: String
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    appliedCoupon: {type: String, default: null},
    discountAmount: {type: Number, default: null},
    shippingFee: {type: Number, default: 0},
    taxAmount: {type: Number, default: 0},
    status: {
      type: String,
      default: 'Processing',
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['razorpay', 'cod'],
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Paid', 'Failed']
    },
    razorpayPaymentId: {
      type: String
    },
    razorpayOrderId: {
      type: String
    },
    razorpaySignature: {
      type: String
    },
    shippingAddress: {
      title: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String
    }
  },
  { timestamps: true }
)

const Order = models.Order || mongoose.model('Order', OrderSchema)
export default Order
