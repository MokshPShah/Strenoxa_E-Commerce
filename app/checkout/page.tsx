"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/cartSlice';
import { FaSpinner, FaMapMarkerAlt, FaCreditCard, FaLock, FaCheckCircle, FaTag } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Dynamic script loader for Razorpay SDK
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function CheckoutContent() {
    const router = useRouter();
    const dispatch = useDispatch();

    // NEW: Grab the coupon code from the URL (e.g., /checkout?coupon=GYMBUDDIES)
    const searchParams = useSearchParams();
    const couponCode = searchParams.get('coupon');

    const cartItems = useSelector((state: RootState) => state.cart.items);

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOrderComplete, setIsOrderComplete] = useState(false);

    // NEW: Dynamic States for Math
    const [storeSettings, setStoreSettings] = useState({ freeShippingThreshold: 100, standardShippingFee: 10, taxRate: 8 });
    const [discount, setDiscount] = useState(0);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    useEffect(() => {
        if (cartItems.length === 0 && !isOrderComplete) {
            router.push('/shop');
            return;
        }

        // Fetch Both Addresses and Store Settings at once
        Promise.all([
            fetch('/api/user/addresses').then(res => res.json()),
            fetch('/api/settings').then(res => res.json())
        ]).then(([addressData, settingsData]) => {
            // Apply Settings
            if (settingsData) setStoreSettings(settingsData);

            // Apply Addresses
            const userAddresses = addressData.addresses || [];
            setAddresses(userAddresses);
            const defaultAddr = userAddresses.find((addr: any) => addr.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr._id);
            else if (userAddresses.length > 0) setSelectedAddressId(userAddresses[0]._id);

            setLoading(false);
        }).catch(() => {
            toast.error("Failed to load checkout data");
            setLoading(false);
        });
    }, [cartItems]);

    // NEW: Validate Coupon from URL to get the discount amount
    useEffect(() => {
        if (couponCode && subtotal > 0) {
            fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, subtotal })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.discountValue) {
                        const calculatedDiscount = data.discountType === 'percentage'
                            ? (subtotal * data.discountValue) / 100
                            : data.discountValue;
                        setDiscount(calculatedDiscount);
                    }
                })
                .catch(() => console.error("Failed to validate coupon"));
        }
    }, [couponCode, subtotal]);

    // NEW: 100% Dynamic Math
    const shipping = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.standardShippingFee;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = discountedSubtotal * (storeSettings.taxRate / 100);
    const total = discountedSubtotal + shipping + tax;

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            return toast.error("Please select a shipping address");
        }

        setIsProcessing(true);
        const shippingAddress = addresses.find(a => a._id === selectedAddressId);

        // --- CASH ON DELIVERY FLOW ---
        if (paymentMethod === 'cod') {
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
                        totalAmount: total,
                        couponCode // <-- Pass the coupon to the backend!
                    }),
                });

                if (!res.ok) throw new Error("Checkout failed");
                const data = await res.json();

                toast.success("Order placed successfully!");
                setIsOrderComplete(true);
                dispatch(clearCart());
                router.push(`/dashboard/orders/${data.orderId}`);
            } catch (error) {
                toast.error("Failed to process order. Please try again.");
                setIsProcessing(false);
            }
            return;
        }

        // --- RAZORPAY FLOW ---
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            toast.error("Razorpay SDK failed to load. Check your connection.");
            setIsProcessing(false);
            return;
        }

        try {
            const orderRes = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total }), // Uses dynamic total
            });

            if (!orderRes.ok) throw new Error("Failed to initialize payment");
            const razorpayOrder = await orderRes.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: "INR",
                name: "Strenoxa",
                description: "Premium Supplements Checkout",
                order_id: razorpayOrder.id,
                theme: { color: "#EC1313" },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                },
                handler: async function (response: any) {
                    try {
                        const finalRes = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                items: cartItems,
                                shippingAddress,
                                paymentMethod: 'razorpay',
                                subtotal,
                                tax,
                                shippingFee: shipping,
                                totalAmount: total,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                couponCode // <-- Pass the coupon to the backend!
                            }),
                        });

                        if (!finalRes.ok) throw new Error("Payment verification failed");

                        const data = await finalRes.json();
                        toast.success("Payment successful!");
                        setIsOrderComplete(true);
                        dispatch(clearCart());
                        router.push(`/dashboard/orders/${data.orderId}`);
                    } catch (error) {
                        toast.error("Payment verification failed. Please contact support.");
                        setIsProcessing(false);
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);

            paymentObject.on('payment.failed', function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
                setIsProcessing(false);
            });

            paymentObject.open();

        } catch (error) {
            toast.error("Failed to start payment process.");
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

                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <FaMapMarkerAlt className="text-[#ec1313]" /> 1. Shipping Address
                            </h2>

                            {addresses.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium mb-4">You don't have any saved addresses.</p>
                                    <button onClick={() => router.push('/dashboard/addresses')} className="text-xs font-black uppercase tracking-widest text-[#ec1313] hover:underline cursor-pointer">
                                        + Add New Address
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative ${selectedAddressId === addr._id ? 'border-[#ec1313] bg-red-50/10 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                        >
                                            {selectedAddressId === addr._id && (
                                                <FaCheckCircle className="absolute top-5 right-5 text-[#ec1313] text-lg cursor-pointer" />
                                            )}
                                            <h3 className="font-black text-sm uppercase tracking-tight mb-2 pr-8 cursor-pointer">{addr.title}</h3>
                                            <p className="text-xs text-slate-600 font-medium cursor-pointer">{addr.street}</p>
                                            <p className="text-xs text-slate-600 font-medium cursor-pointer">{addr.city}, {addr.state} {addr.zip}</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1 cursor-pointer">{addr.country}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <FaCreditCard className="text-[#ec1313]" /> 2. Payment Method
                            </h2>

                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#ec1313] bg-red-50/10' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#ec1313] cursor-pointer" />
                                    <div className="cursor-pointer">
                                        <p className="font-black text-sm uppercase tracking-tight cursor-pointer">Online Payment (Razorpay)</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5 cursor-pointer">Cards, UPI, Netbanking</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#ec1313] bg-red-50/10' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#ec1313] cursor-pointer" />
                                    <div className="cursor-pointer">
                                        <p className="font-black text-sm uppercase tracking-tight cursor-pointer">Cash on Delivery</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5 cursor-pointer">Pay when you receive your gear</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 lg:sticky lg:top-32">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Order Summary</h2>

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

                            <div className="space-y-3 border-t border-slate-100 pt-6 mb-6">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                                </div>

                                {/* VISUAL UPDATE: Shows the discount glowing green if applied */}
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm font-medium text-green-600">
                                        <span className="flex items-center gap-1.5"><FaTag size={10} /> Discount ({couponCode})</span>
                                        <span className="font-bold">-${discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-bold text-slate-900">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Estimated Tax ({storeSettings.taxRate}%)</span>
                                    <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-100 pt-6 mb-8">
                                <span className="text-lg font-black uppercase tracking-tight">Total</span>
                                <span className="text-2xl font-black text-[#ec1313]">${total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || !selectedAddressId}
                                className="w-full bg-slate-950 hover:bg-black text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isProcessing ? <FaSpinner className="animate-spin cursor-pointer" /> : <FaLock className="cursor-pointer" />}
                                <span className="cursor-pointer">{isProcessing ? "Processing..." : "Place Order"}</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Next.js 14+ requires useSearchParams to be wrapped in a Suspense boundary
export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-[#ec1313]" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}