"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPrint, FaSpinner } from "react-icons/fa";

export default function InvoicePage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${params.id}`)
                if (!res.ok) throw new Error("Failed to load order")

                const data = await res.json();
                setOrder(data.order);
            } catch (error) {
                toast.error("Could not load invoice");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [params.id])
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>;
    }

    if (!order) return <div className="p-8 text-center">Invoice not found.</div>;

    return (
        <div className="min-h-screen bg-white text-black p-8 font-sans max-w-4xl mx-auto">

            {/* Action Bar (Hidden when actually printing) */}
            <div className="flex justify-end mb-8 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-slate-950 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                    <FaPrint /> Print / Save PDF
                </button>
            </div>

            {/* INVOICE CONTENT */}
            <div className="border border-slate-200 p-8 sm:p-12 rounded-3xl">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b border-slate-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#ec1313]">STRENOXA</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Premium Performance Gear</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Invoice</h2>
                        <p className="text-sm text-slate-600 font-medium">Order #: <span className="font-bold text-black">{order._id.substring(0, 10).toUpperCase()}</span></p>
                        <p className="text-sm text-slate-600 font-medium">Date: <span className="font-bold text-black">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                        <p className="text-sm text-slate-600 font-medium">Status: <span className="font-bold text-[#ec1313]">{order.status}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Billed / Shipped To:</h3>
                        <p className="font-bold text-sm uppercase">{order.shippingAddress?.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{order.shippingAddress?.street}</p>
                        <p className="text-sm text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{order.shippingAddress?.country}</p>
                    </div>
                    <div className="sm:text-right">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Payment Method:</h3>
                        <p className="text-sm font-bold text-slate-900 uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="w-full mb-8">
                    <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-3 mb-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="col-span-6">Item</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>

                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 border-b border-slate-100 pb-4 mb-4 text-sm font-medium">
                            <div className="col-span-6 font-bold text-black uppercase">{item.name} <span className="block text-xs text-slate-500 font-medium mt-0.5">Flavor: {item.flavor}</span></div>
                            <div className="col-span-2 text-center">{item.quantity}</div>
                            <div className="col-span-2 text-right">${(item.price || 0).toFixed(2)}</div>
                            <div className="col-span-2 text-right font-bold">${((item.price || 0) * item.quantity).toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-full sm:w-64 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-bold text-black">${(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Shipping</span>
                            <span className="font-bold text-black">{order.shippingFee === 0 ? 'FREE' : `$${(order.shippingFee || 0).toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 border-b border-slate-200 pb-3">
                            <span>Tax</span>
                            <span className="font-bold text-black">${(order.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black uppercase pt-1">
                            <span>Total</span>
                            <span className="text-[#ec1313]">${(order.totalAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}