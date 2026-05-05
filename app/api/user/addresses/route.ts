import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        return NextResponse.json({ addresses: user?.addresses || [] });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const body = await req.json();

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (!user.addresses) {
            user.addresses = [];
        }

        // THE FIX: Explicitly format the data. Force zip to be a String, and give country a fallback.
        const newAddress = {
            title: body.title || "My Address",
            street: body.street || "",
            city: body.city || "",
            state: body.state || "",
            zip: String(body.zip || ""), // Forces "gfgrt" (or any number) to be safely saved as a string
            country: body.country || "India", // Fallback to prevent "Path is required" error
            isDefault: Boolean(body.isDefault || false)
        };

        if (newAddress.isDefault) {
            user.addresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
        }

        // Push the perfectly formatted address
        user.addresses.push(newAddress);
        await user.save();

        return NextResponse.json({ message: "Address added successfully" });
    } catch (error) {
        console.error("Address POST Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const body = await req.json();

        const { addressId, ...updateData } = body;

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (updateData.isDefault) {
            user.addresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
        }

        const addressToUpdate = user.addresses.id(addressId);
        if (!addressToUpdate) return NextResponse.json({ error: "Address not found" }, { status: 404 });

        addressToUpdate.title = updateData.title || "My Address";
        addressToUpdate.street = updateData.street || "";
        addressToUpdate.city = updateData.city || "";
        addressToUpdate.state = updateData.state || "";
        addressToUpdate.zip = String(updateData.zip || "");
        addressToUpdate.country = updateData.country || "India";
        addressToUpdate.isDefault = Boolean(updateData.isDefault || false);

        await user.save();

        return NextResponse.json({ message: "Address updated successfully" });
    } catch (error) {
        console.error("Address PUT Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get('id');

        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $pull: { addresses: { _id: addressId } } }
        );
        return NextResponse.json({ message: "Address deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}