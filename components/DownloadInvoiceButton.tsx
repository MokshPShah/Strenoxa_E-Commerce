"use client";

import React, { useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DownloadInvoiceProps {
    order: any;
    userName: string;
}

export default function DownloadInvoiceButton({ order, userName }: DownloadInvoiceProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = () => {
        setIsGenerating(true);

        try {
            const doc = new jsPDF();
            const orderId = order._id.toString().slice(-6).toUpperCase();

            // Calculate Totals
            const orderTotal = parseFloat(order.totalAmount);
            const shippingFee = orderTotal > 100 ? 0 : 10;
            const subTotal = orderTotal - shippingFee;
            const totalQuantity = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

            // --- 1. PREMIUM HEADER BLOCK ---
            doc.setFillColor(15, 23, 42); // Slate 900 Background
            doc.rect(0, 0, 210, 45, 'F');

            // Brand Text
            doc.setFontSize(28);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("STRENOXA", 14, 25);

            // Subtle Red Accent Line
            doc.setDrawColor(236, 19, 19);
            doc.setLineWidth(1);
            doc.line(14, 30, 68, 30);

            doc.setFontSize(9);
            doc.setTextColor(200, 200, 200);
            doc.setFont("helvetica", "normal");
            doc.text("Premium Gym Supplements", 14, 36);

            // Invoice Title Right Aligned
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("INVOICE", 196, 25, { align: "right" });

            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.setFont("helvetica", "normal");
            doc.text(`Order ID: #${orderId}`, 196, 31, { align: "right" });
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 196, 36, { align: "right" });

            // --- 2. BILL TO & ORDER DETAILS ---
            doc.setTextColor(15, 23, 42); // Revert to Slate 900 for body

            // Bill To
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("BILLED TO:", 14, 60);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(userName, 14, 66);
            doc.text(order.shippingAddress?.street || "", 14, 71);
            doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zip || order.shippingAddress?.zipcode || ""}`, 14, 76);
            doc.text(order.shippingAddress?.country || "", 14, 81);

            // Payment Info
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text("PAYMENT STATUS:", 196, 60, { align: "right" });

            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            const isPaid = order.paymentMethod === 'razorpay';
            doc.text(isPaid ? "Paid via Online Gateway" : "Cash On Delivery (Pending)", 196, 66, { align: "right" });
            if (isPaid && order.razorpayPaymentId) {
                doc.text(`Trans ID: ${order.razorpayPaymentId}`, 196, 71, { align: "right" });
            }

            // --- 3. ITEMIZED TABLE ---
            const tableColumn = ["Item Description", "Flavor", "Qty", "Unit Price", "Total"];
            const tableRows: any[] = [];

            order.items.forEach((item: any) => {
                const itemData = [
                    item.name,
                    item.flavor || "Standard",
                    item.quantity.toString(),
                    `$${item.price.toFixed(2)}`,
                    `$${(item.price * item.quantity).toFixed(2)}`,
                ];
                tableRows.push(itemData);
            });

            autoTable(doc, {
                startY: 95,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid', // Cleaner, more premium look than striped
                headStyles: {
                    fillColor: [15, 23, 42], // Slate 900 header
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    textColor: [50, 50, 50],
                    halign: 'center'
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' }, // Left align item name
                    4: { fontStyle: 'bold', textColor: [15, 23, 42] } // Bold totals
                },
                styles: { fontSize: 9, cellPadding: 5 },
                alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate 50 alternate
            });

            // --- 4. FINANCIAL SUMMARY ---
            const finalY = (doc as any).lastAutoTable.finalY + 15;

            // Draw a subtle line above totals
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.setLineWidth(0.5);
            doc.line(130, finalY - 5, 196, finalY - 5);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont("helvetica", "normal");

            // Total Quantity
            doc.text(`Total Items:`, 150, finalY);
            doc.text(`${totalQuantity}`, 196, finalY, { align: "right" });

            // Subtotal
            doc.text(`Subtotal:`, 150, finalY + 7);
            doc.text(`$${subTotal.toFixed(2)}`, 196, finalY + 7, { align: "right" });

            // Shipping
            doc.text(`Shipping:`, 150, finalY + 14);
            doc.text(shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`, 196, finalY + 14, { align: "right" });

            // Grand Total
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(236, 19, 19); // Strenoxa Red
            doc.text(`TOTAL PAID:`, 150, finalY + 24);
            doc.text(`$${orderTotal.toFixed(2)}`, 196, finalY + 24, { align: "right" });

            // --- 5. FOOTER ---
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.setFont("helvetica", "normal");
            doc.text("Thank you for trusting Strenoxa. For support, email support@strenoxa.com.", 105, 280, { align: "center" });

            // Trigger Download
            doc.save(`Strenoxa_Invoice_${orderId}.pdf`);

        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
            {isGenerating ? <FaSpinner className="animate-spin cursor-pointer" /> : <FaDownload className="cursor-pointer" />}
            <span className="cursor-pointer">{isGenerating ? "Generating..." : "Download Invoice"}</span>
        </button>
    );
}