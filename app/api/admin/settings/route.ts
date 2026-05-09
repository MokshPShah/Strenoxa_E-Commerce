import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    return session && (role === 'admin' || role === 'super admin');
}

export async function GET() {
    try {
        if (!await verifyAdmin()) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        await connectDB();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        if (!await verifyAdmin()) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const updatedSettings = await Settings.findOneAndUpdate({}, body, { new: true, upsert: true });
        return NextResponse.json({ message: "Settings saved successfully", settings: updatedSettings });
    } catch (error) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}