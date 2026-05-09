import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
    try {
        await connectDB();
        const settings = await Settings.findOne();

        if (!settings) {
            // Fallback defaults if the admin hasn't saved settings yet
            return NextResponse.json({
                freeShippingThreshold: 100,
                standardShippingFee: 10,
                taxRate: 8,
                maintenanceMode: false
            });
        }

        return NextResponse.json({
            freeShippingThreshold: settings.freeShippingThreshold,
            standardShippingFee: settings.standardShippingFee,
            taxRate: settings.taxRate,
            maintenanceMode: settings.maintenanceMode
        });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
    }
}