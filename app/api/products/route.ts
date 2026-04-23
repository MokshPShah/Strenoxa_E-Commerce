import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const trending = searchParams.get('trending')

    let query: any = {}

    if (category) {
      query.category = category
    }
    if (trending === 'true') {
      query.isTrending = true
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean()

    // 🚨 THE FIX: Force 'undefined' stock from old MongoDB documents to safely evaluate to 0
    const normalizedProducts = products.map((p: any) => ({
      ...p,
      stock: p.stock ?? 0 
    }));

    console.log(`[API] Fetched ${normalizedProducts.length} products from DB.`);

    return NextResponse.json(normalizedProducts, { status: 200 })
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const newProduct = await Product.create(body);
    
    console.log(`[DATABASE] Added new product: ${newProduct.name}`);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}