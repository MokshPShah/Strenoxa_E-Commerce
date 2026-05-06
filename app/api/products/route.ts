import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const searchQuery = searchParams.get('q')
    const category = searchParams.get('category')
    const trending = searchParams.get('trending')

    let products;

    if (searchQuery && searchQuery !== 'null' && searchQuery.trim() !== '') {
      const aggerationPipeline: any[] = [
        {
          $search: {
            index: "default",
            text: {
              query: searchQuery,
              path: ["name", "description", "category"],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 0
              }
            }
          }
        }
      ]
      const matchFilters: any = {}
      if (category) {
        matchFilters.category = category
      }
      if (trending === 'true') {
        matchFilters.isTrending = true
      }
      if (Object.keys(matchFilters).length > 0) {
        aggerationPipeline.push({ $match: matchFilters })
      }

      aggerationPipeline.push({ $sort: { createdAt: -1 } });

      products = await Product.aggregate(aggerationPipeline)
    } else {
      let query: any = {}
      if (category) {
        query.category = category
      }
      if (trending === 'true') {
        query.isTrending = true
      }
      products = await Product.find(query).sort({ createdAt: -1 }).lean()
    }

    const normalizedProducts = products.map((p: any) => ({
      ...p,
      stock: p.stock ?? 0
    }));

    console.log(`[API] Fetched ${normalizedProducts.length} products from DB.`);

    return NextResponse.json({ products: normalizedProducts }, { status: 200 })
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