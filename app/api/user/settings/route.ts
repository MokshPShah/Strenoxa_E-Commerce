import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const body = await req.json();
        const user = await User.findOne({ email: session.user.email });

        if (body.action === 'updateProfile') {
            user.name = body.name;
            await user.save();
            return NextResponse.json({ message: "Profile updated" });
        }

        if (body.action === 'updatePassword') {
            const isMatch = await bcrypt.compare(body.currentPassword, user.password);
            if (!isMatch) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });

            user.password = await bcrypt.hash(body.newPassword, 10);
            await user.save();
            return NextResponse.json({ message: "Password updated" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}