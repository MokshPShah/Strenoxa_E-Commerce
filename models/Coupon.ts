import mongoose, { Schema, models } from "mongoose";

const CouponSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    isNewUserOnly: { type: Boolean, default: false },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String }
}, { timestamps: true })

export default models.Coupon || mongoose.model("Coupon", CouponSchema)