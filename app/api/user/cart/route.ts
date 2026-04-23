import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import "@/models/Product";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ cart: [] }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).populate("cart.productId");

  if (!user) return NextResponse.json({ cart: [] });

  const formattedCart = user.cart.map((item: any) => {
    if (!item.productId) return null;

    return {
      _id: item.productId._id.toString(),
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image || item.productId.images?.[0] || "",
      slug: item.productId.slug,
      quantity: item.quantity,
      flavor: item.flavor
    };
  }).filter(Boolean);

  return NextResponse.json({ cart: formattedCart });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const { cartItems } = await req.json()
  await connectDB()

  await User.findOneAndUpdate(
    { email: session.user.email },
    { cart: cartItems }
  )

  return NextResponse.json({ message: 'Cart synced' })
}
