import mongoose, { Document, Schema } from 'mongoose'

export interface IAddress {
  id?: mongoose.Types.ObjectId
  title: string
  street: string
  city: string
  state: string
  zip: number
  country: string
  isDefault: boolean
}

export interface IUser extends Document {
  name?: string
  email?: string
  password?: string
  role: 'user' | 'admin'
  image?: string
  cart: {
    productId: mongoose.Types.ObjectId
    quantity: number
    flavor?: string
  }[]
  favorites: mongoose.Types.ObjectId[]
  addresses: IAddress[]
  createdAt: Date
}

const AddressSchema = new Schema<IAddress>({
  title: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: Number, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
})

const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin', 'super admin'], default: 'user' },
  image: { type: String },
  cart: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      flavor: { type: String }
    }
  ],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  addresses: { type: [AddressSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
