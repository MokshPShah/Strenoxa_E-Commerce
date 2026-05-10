"use client";

import { useEffect, useState } from "react";
import { FaHistory, FaBoxOpen, FaTruck, FaCheckCircle, FaSpinner, FaTimes } from "react-icons/fa";
import UserDashboardShell from "@/components/UserDashboardShell";
import toast from "react-hot-toast";

export default function DashboardOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State for tracking modal
    const [trackingOrder, setTrackingOrder] = useState<any | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch('/api/user/orders');
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) {
                toast.error("Failed to load order history");
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const handleTrackPackage = (order: any) => {
        setTrackingOrder(order);
    };

    const handleViewInvoice = (orderId: string) => {
        // Opens the invoice page in a new tab
        window.open(`/dashboard/orders/${orderId}/invoice`, '_blank');
    };

    return (
        <UserDashboardShell>
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    <FaHistory className="text-[#ec1313]" /> Order History
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Review past transactions and track your current deliveries.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-3xl text-[#ec1313]" /></div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <FaBoxOpen className="text-3xl sm:text-4xl text-slate-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">No orders yet</h2>
                    <p className="text-sm sm:text-base text-slate-500 font-medium mb-8 max-w-md">
                        When you purchase gear, your order history will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-6 relative">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm group">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Placed</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-sm font-bold text-slate-900">${(order.totalAmount || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order #</p>
                                    <p className="text-sm font-bold text-slate-900">{order._id.substring(0, 8).toUpperCase()}</p>
                                </div>

                                <div className="sm:ml-auto">
                                    <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full w-fit ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {order.status === 'Delivered' ? <FaCheckCircle /> : <FaTruck />}
                                        {order.status || 'Processing'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-xl p-2 border border-slate-100 flex-shrink-0">
                                            <img src={item.productId?.image || item.productId?.images?.[0] || "/placeholder.png"} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{item.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button onClick={() => handleTrackPackage(order)} className="cursor-pointer bg-slate-950 hover:bg-black text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center shadow-md active:scale-[0.98]">
                                    Track Package
                                </button>
                                <button onClick={() => handleViewInvoice(order._id)} className="cursor-pointer bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center active:scale-[0.98]">
                                    View Invoice
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* TRACKING MODAL OVERLAY */}
                    {trackingOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-black uppercase tracking-tight text-lg text-slate-900">Track Shipment</h3>
                                    <button onClick={() => setTrackingOrder(null)} className="text-slate-400 hover:text-[#ec1313] transition-colors cursor-pointer">
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <div className="p-8">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-center">
                                        Order ID: {trackingOrder._id.substring(0, 8).toUpperCase()}
                                    </p>

                                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">

                                        {/* Step 1: Placed */}
                                        <div className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#ec1313] shadow-[0_0_0_4px_white]" />
                                            <p className="font-black text-sm uppercase text-slate-900">Order Placed</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">We have received your order.</p>
                                        </div>

                                        {/* Step 2: Processing */}
                                        <div className="relative pl-6">
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full shadow-[0_0_0_4px_white] ${['Processing', 'Shipped', 'Delivered'].includes(trackingOrder.status) ? 'bg-[#ec1313]' : 'bg-slate-200'}`} />
                                            <p className={`font-black text-sm uppercase ${['Processing', 'Shipped', 'Delivered'].includes(trackingOrder.status) ? 'text-slate-900' : 'text-slate-400'}`}>Processing</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">We are preparing your gear.</p>
                                        </div>

                                        {/* Step 3: Shipped */}
                                        <div className="relative pl-6">
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full shadow-[0_0_0_4px_white] ${['Shipped', 'Delivered'].includes(trackingOrder.status) ? 'bg-[#ec1313]' : 'bg-slate-200'}`} />
                                            <p className={`font-black text-sm uppercase ${['Shipped', 'Delivered'].includes(trackingOrder.status) ? 'text-slate-900' : 'text-slate-400'}`}>Shipped</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">Handed over to delivery partner.</p>
                                        </div>

                                        {/* Step 4: Delivered */}
                                        <div className="relative pl-6">
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full shadow-[0_0_0_4px_white] ${trackingOrder.status === 'Delivered' ? 'bg-[#ec1313]' : 'bg-slate-200'}`} />
                                            <p className={`font-black text-sm uppercase ${trackingOrder.status === 'Delivered' ? 'text-slate-900' : 'text-slate-400'}`}>Delivered</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">Your package has arrived.</p>
                                        </div>
                                    </div>

                                    <button onClick={() => setTrackingOrder(null)} className="w-full mt-8 bg-slate-950 hover:bg-black text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                                        Close Tracker
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </UserDashboardShell>
    );
}