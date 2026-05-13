import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
    // 1. Await the params to comply with Next.js App Router rules
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "admin" && userRole !== "super admin") redirect("/");

    await connectDB();

    // Fetch the specific product directly from MongoDB
    const rawProduct = await Product.findById(id).lean();

    // Prevent editing if it doesn't exist or is in the recycle bin
    if (!rawProduct || rawProduct.isDeleted) {
        notFound();
    }

    // Serialize MongoDB data to pass safely to the Client Component
    const productData = {
        ...rawProduct,
        _id: rawProduct._id.toString(),
        createdAt: rawProduct.createdAt ? new Date(rawProduct.createdAt).toISOString() : null,
        updatedAt: rawProduct.updatedAt ? new Date(rawProduct.updatedAt).toISOString() : null,
        // Ensure nested objects default safely if they were missing in older docs
        longDesc: rawProduct.longDesc || { paragraphs: [""], bullets: [""] },
        supplementFacts: rawProduct.supplementFacts || { servingSize: "", servingsPerContainer: 0, ingredients: [] },
        flavors: rawProduct.flavors || [],
        images: rawProduct.images || []
    };

    // 2. Bulletproof Server-to-Client Serialization Boundary Fix
    const safeProductData = JSON.parse(JSON.stringify(productData));

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <EditProductForm initialData={safeProductData} />
        </div>
    );
}