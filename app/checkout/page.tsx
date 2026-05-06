"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Note: Adjust these Redux imports to match your actual store setup
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/cartSlice';

import { FaSpinner, FaMapMarkerAlt, FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    // 1. Pull Cart Data from Redux
    const cartItems = useSelector((state: RootState) => state.cart.items);

    // 2. Local State
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // 3. Calculate Totals
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% dummy tax
    const total = subtotal + shipping + tax;

    useEffect(() => {
        // If cart is empty, kick them back to shop
        if (cartItems.length === 0) {
            router.push('/shop');
            return;
        }
        fetchAddresses();
    }, [cartItems]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses');
            const data = await res.json();

            const userAddresses = data.addresses || [];
            setAddresses(userAddresses);

            // AUTO-SELECT the default address!
            const defaultAddr = userAddresses.find((addr: any) => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
            } else if (userAddresses.length > 0) {
                setSelectedAddressId(userAddresses[0]._id);
            }
        } catch (error) {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            return toast.error("Please select a shipping address");
        }

        setIsProcessing(true);

        // Find the full address object to save with the order
        const shippingAddress = addresses.find(a => a._id === selectedAddressId);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems,
                    shippingAddress,
                    paymentMethod,
                    subtotal,
                    tax,
                    shippingFee: shipping,
                    totalAmount: total
                }),
            });

            if (!res.ok) throw new Error("Checkout failed");

            const data = await res.json();

            toast.success("Order placed successfully!");
            dispatch(clearCart()); // Empty the Redux cart
            router.push(`/dashboard/orders?success=true&id=${data.orderId}`); // Send them to their order history

        } catch (error) {
            toast.error("Failed to process order. Please try again.");
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>;

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 md:pt-32 pb-24 font-sans text-slate-800">
            <div className="max-w-[1200px] mx-auto px-4 md:px-8">

                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-8">Secure Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* LEFT COLUMN: Shipping & Payment */}
                    <div className="flex-1 space-y-8">

                        {/* Shipping Address Section */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <FaMapMarkerAlt className="text-[#ec1313]" /> 1. Shipping Address
                            </h2>

                            {addresses.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium mb-4">You don't have any saved addresses.</p>
                                    <button onClick={() => router.push('/dashboard/addresses')} className="text-xs font-black uppercase tracking-widest text-[#ec1313] hover:underline">
                                        + Add New Address
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative ${selectedAddressId === addr._id ? 'border-[#ec1313] bg-red-50/10 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            {selectedAddressId === addr._id && (
                                                <FaCheckCircle className="absolute top-5 right-5 text-[#ec1313] text-lg" />
                                            )}
                                            <h3 className="font-black text-sm uppercase tracking-tight mb-2 pr-8">{addr.title}</h3>
                                            <p className="text-xs text-slate-600 font-medium">{addr.street}</p>
                                            <p className="text-xs text-slate-600 font-medium">{addr.city}, {addr.state} {addr.zip}</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1">{addr.country}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <FaCreditCard className="text-[#ec1313]" /> 2. Payment Method
                            </h2>

                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-[#ec1313] bg-red-50/10' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#ec1313]" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tight">Credit / Debit Card</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Secure payment via Stripe</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#ec1313] bg-red-50/10' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#ec1313]" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tight">Cash on Delivery</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Pay when you receive your gear</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 lg:sticky lg:top-32">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Order Summary</h2>

                            {/* Items List */}
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-xl p-2 border border-slate-100 flex-shrink-0">
                                            <img src={item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-xs uppercase tracking-tight line-clamp-2">{item.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1">QTY: {item.quantity}</p>
                                        </div>
                                        <div className="font-black text-sm">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-3 border-t border-slate-100 pt-6 mb-6">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-bold text-slate-900">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Estimated Tax</span>
                                    <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center border-t border-slate-100 pt-6 mb-8">
                                <span className="text-lg font-black uppercase tracking-tight">Total</span>
                                <span className="text-2xl font-black text-[#ec1313]">${total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || !selectedAddressId}
                                className="w-full bg-slate-950 hover:bg-black text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <FaSpinner className="animate-spin" /> : <FaLock />}
                                {isProcessing ? "Processing..." : "Place Order"}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}