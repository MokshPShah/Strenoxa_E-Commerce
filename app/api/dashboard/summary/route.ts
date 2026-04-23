import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// CRITICAL: Explicitly import Product so Mongoose registers the schema before populating
import "@/models/Product"; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Populate both cart and favorites to get full product data
    const user = await User.findOne({ email: session.user.email })
      .populate('favorites')
      .populate('cart.productId')
      .lean(); 

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favoriteCount = user.favorites ? user.favorites.length : 0;

    const cart = user.cart || [];
    let validCartItemCount = 0;
    let outOfStockCartItemCount = 0;

    cart.forEach((item: any) => {
      const product = item.productId;
      if (!product) return; 

      // Fallback to 0 if stock doesn't exist on older MongoDB documents
      const currentStock = product.stock ?? 0;
      
      if (currentStock > 0) {
        validCartItemCount++;
      } else {
        outOfStockCartItemCount++;
      }
    });

    const summaryData = {
      favoriteCount,
      validCartItemCount,
      outOfStockCartItemCount,
    };

    return NextResponse.json(summaryData, { status: 200 });

  } catch (error) {
    console.error("Dashboard Summary API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}