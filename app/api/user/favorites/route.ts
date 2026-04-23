import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import "@/models/Product";

interface PopulatedProduct {
    _id: { toString: () => string },
    name: string,
    price: number,
    image: string,
    images: string,
    slug: string,
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json({ favorites: [] }, { status: 401 });
        }

        await connectDB()
        const user = await User.findOne({ email: session.user.email }).populate('favorites')

        if (!user) return NextResponse.json({ favorites: [] })

        const formattedFavorites = user.favorites.map((product: unknown) => {
            const p = product as PopulatedProduct;
            if (!p || !p._id) return null;

            return {
                _id: p._id.toString(),
                name: p.name,
                price: p.price,
                image: p.image || p.images?.[0] || "",
                slug: p.slug,
            }
        }).filter(Boolean)

        return NextResponse.json({ favorites: formattedFavorites })
    } catch (error) {
        console.error("Failed to fetch favorites:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json({ favorites: [] }, { status: 401 });
        }

        const body = await req.json()
        const { favorites } = body

        if (!Array.isArray(favorites)) {
            return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
        }
        await connectDB()

        await User.findOneAndUpdate(
            { email: session.user.email },
            { favorites: favorites }
        )

        return NextResponse.json({ message: 'Favorites Synced Successfully' })
    } catch (error) {
        console.error("Failed to sync favorites:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}