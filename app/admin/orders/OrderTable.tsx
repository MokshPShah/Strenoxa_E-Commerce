"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaBoxOpen, FaEye, FaTimes, FaBox, FaMapMarkerAlt, FaCreditCard, FaTruck } from "react-icons/fa";

export default function OrderTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.name || order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.email || order.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOrderUpdate = async (orderId: string, field: 'status' | 'paymentStatus', newValue: string) => {
        setIsUpdating(orderId);

        try {
            const payload = { orderId: orderId, [field]: newValue };

            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setOrders(orders.map(o => {
                    if (o._id !== orderId) return o;
                    const updatedOrder = { ...o, [field]: newValue };
                    if (field === 'status' && newValue === 'Delivered' && String(o.paymentMethod).toLowerCase() !== 'razorpay') {
                        updatedOrder.paymentStatus = 'Paid';
                    }
                    return updatedOrder;
                }));

                if (selectedOrder && selectedOrder._id === orderId) {
                    const updatedModalOrder = { ...selectedOrder, [field]: newValue };
                    if (field === 'status' && newValue === 'Delivered' && String(selectedOrder.paymentMethod).toLowerCase() !== 'razorpay') {
                        updatedModalOrder.paymentStatus = 'Paid';
                    }
                    setSelectedOrder(updatedModalOrder);
                }

                toast.success(`${field === 'status' ? 'Delivery' : 'Payment'} updated to ${newValue}`);
            } else {
                toast.error("Failed to update");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return "bg-green-100 text-green-700";
            case 'Shipped': return "bg-purple-100 text-purple-700";
            case 'Processing': return "bg-blue-100 text-blue-700";
            case 'Cancelled': return "bg-red-100 text-red-700";
            default: return "bg-orange-100 text-orange-700";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">

            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-slate-400 transition-colors cursor-text"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Order Details</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4 text-center">Delivery</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <FaBoxOpen size={32} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-bold">No orders found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const customerName = order.user?.name || order.customerName || "Unknown User";
                                const customerEmail = order.user?.email || order.customerEmail || "N/A";

                                // Safely check if it's Razorpay, otherwise default to COD
                                const isRazorpay = String(order.paymentMethod).toLowerCase() === 'razorpay';

                                return (
                                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">#{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    month: "short", day: "numeric", year: "numeric"
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{customerName}</p>
                                            <p className="text-xs text-slate-500">{customerEmail}</p>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">
                                            ${(order.totalAmount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${isRazorpay ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    {isRazorpay ? 'Razorpay' : 'COD'}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {order.paymentStatus || 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <select
                                                disabled={isUpdating === order._id}
                                                value={order.status}
                                                onChange={(e) => handleOrderUpdate(order._id, 'status', e.target.value)}
                                                className={`appearance-none text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer border-2 border-transparent hover:border-slate-200 focus:outline-none transition-all ${getStatusColor(order.status)} ${isUpdating === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="Pending" className="text-slate-900 bg-white cursor-pointer">Pending</option>
                                                <option value="Processing" className="text-slate-900 bg-white cursor-pointer">Processing</option>
                                                <option value="Shipped" className="text-slate-900 bg-white cursor-pointer">Shipped</option>
                                                <option value="Delivered" className="text-slate-900 bg-white cursor-pointer">Delivered</option>
                                                <option value="Cancelled" className="text-slate-900 bg-white cursor-pointer">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-slate-400 hover:text-[#ec1313] transition-colors cursor-pointer p-2 flex items-center justify-end gap-2 ml-auto"
                                            >
                                                <FaEye size={16} className="cursor-pointer" /> <span className="text-xs font-bold uppercase cursor-pointer">Details</span>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">

                        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center z-10 rounded-t-3xl gap-4">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                    Order <span className="text-[#ec1313]">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 border border-slate-200 p-1.5 rounded-xl bg-slate-50">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Status:</span>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => handleOrderUpdate(selectedOrder._id, 'status', e.target.value)}
                                        disabled={isUpdating === selectedOrder._id}
                                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-black uppercase text-slate-900 outline-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="Pending" className="cursor-pointer">Pending</option>
                                        <option value="Processing" className="cursor-pointer">Processing</option>
                                        <option value="Shipped" className="cursor-pointer">Shipped</option>
                                        <option value="Delivered" className="cursor-pointer">Delivered</option>
                                        <option value="Cancelled" className="cursor-pointer">Cancelled</option>
                                    </select>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-[#ec1313] p-2 bg-slate-100 rounded-full cursor-pointer transition-colors">
                                    <FaTimes size={18} className="cursor-pointer" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50/50 flex-grow">

                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm flex items-center gap-2">
                                    <FaBox className="text-slate-400" /> Purchased Items
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 p-2 text-xs text-center font-bold text-slate-300 overflow-hidden flex-shrink-0">
                                                    {item.productId?.image ? (
                                                        <img src={item.productId.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <span>No Image</span>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">Flavor: {item.flavor || "Standard"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                                    <p className="text-xs text-slate-400 font-bold">{item.quantity} x ${(item.price || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 italic p-4">Item details unavailable for this older test order.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">

                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm flex items-center gap-2 mb-3">
                                        <FaMapMarkerAlt className="text-slate-400" /> Shipping Info
                                    </h3>
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-sm font-medium text-slate-600">
                                        <p className="font-black text-slate-900 mb-1">{selectedOrder.user?.name || selectedOrder.customerName || "Unknown"}</p>
                                        <p>{selectedOrder.user?.email || selectedOrder.customerEmail || ""}</p>
                                        <div className="mt-2 pt-2 border-t border-slate-50">
                                            <p>{selectedOrder.shippingAddress?.street || "No street provided"}</p>
                                            {(selectedOrder.shippingAddress?.city || selectedOrder.shippingAddress?.state) && (
                                                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
                                            )}
                                            <p>{selectedOrder.shippingAddress?.country}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm flex items-center gap-2 mb-3">
                                        <FaCreditCard className="text-slate-400" /> Payment Details
                                    </h3>
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-sm space-y-3">
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                            <span className="font-medium text-slate-500">Method</span>
                                            <span className="font-bold text-slate-900 flex items-center gap-2">
                                                {String(selectedOrder.paymentMethod).toLowerCase() === 'razorpay' ? (
                                                    <><FaCreditCard className="text-blue-500" /> Razorpay</>
                                                ) : (
                                                    <><FaTruck className="text-slate-400" /> COD</>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                            <span className="font-medium text-slate-500">Status</span>
                                            <select
                                                value={selectedOrder.paymentStatus || 'Pending'}
                                                onChange={(e) => handleOrderUpdate(selectedOrder._id, 'paymentStatus', e.target.value)}
                                                disabled={isUpdating === selectedOrder._id}
                                                className={`font-black uppercase tracking-widest text-[10px] px-2 py-1 rounded-md outline-none cursor-pointer border border-transparent hover:border-slate-200 transition-colors disabled:opacity-50 ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}
                                            >
                                                <option value="Pending" className="bg-white text-slate-900 cursor-pointer">PENDING</option>
                                                <option value="Paid" className="bg-white text-slate-900 cursor-pointer">PAID</option>
                                                <option value="Failed" className="bg-white text-slate-900 cursor-pointer">FAILED</option>
                                                <option value="Refunded" className="bg-white text-slate-900 cursor-pointer">REFUNDED</option>
                                            </select>
                                        </div>

                                        {selectedOrder.razorpayPaymentId && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-500">Trans ID</span>
                                                <span className="font-mono text-xs text-slate-400" title={selectedOrder.razorpayPaymentId}>
                                                    {selectedOrder.razorpayPaymentId.slice(0, 10)}...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#ec1313] text-white rounded-2xl p-6 shadow-md flex justify-between items-center">
                                    <span className="font-black uppercase tracking-widest text-xs opacity-80">Total Value</span>
                                    <span className="text-2xl font-black">${(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}