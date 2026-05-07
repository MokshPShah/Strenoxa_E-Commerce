"use client";

import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaMinus, FaArrowRight, FaCheckCircle, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { FaCreditCard, FaLock, FaPaypal } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart, decreaseQuantity, removeFromCart, setCart } from "@/store/cartSlice";
import { useState } from "react";
import toast from "react-hot-toast";
import { TbShoppingCartQuestion } from "react-icons/tb";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCode, setAppliedCode] = useState("");

    // 1. BULLETPROOF FALLBACK: Use ?? to assume a safe stock level (like 100) if undefined on refresh
    const validItems = cartItems.filter(item => (item.stock ?? 100) > 0);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Calculate subtotal ONLY for valid, in-stock items
    const subtotal = validItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    const shipping = subtotal > 99.00 || subtotal === 0 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal - discount + shipping + tax;

    const handleApplyCoupon = async () => {
        if (!promoCode) return;

        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoCode, subtotal })
            });

            const data = await res.json();

            if (res.ok) {
                // Calculate discount based on type
                const calculatedDiscount = data.discountType === 'percentage'
                    ? (subtotal * data.discountValue) / 100
                    : data.discountValue;

                setDiscount(calculatedDiscount);
                setAppliedCode(promoCode.toUpperCase());
                toast.success(`Coupon Applied: -$${calculatedDiscount.toFixed(2)}`);
            } else {
                setDiscount(0);
                setAppliedCode("");
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to validate coupon");
        }
    };

    const handleQuantityChange = (item: any, action: "increase" | "decrease", maxStock: number) => {
        if (action === "increase") {
            if (item.quantity >= maxStock) {
                toast.error(`Only ${maxStock} items left in stock!`);
                return;
            }
            dispatch(addToCart({ ...item, quantity: 1, stock: maxStock }));

            // Re-validate coupon if subtotal increases (optional but good practice)
            if (appliedCode) {
                toast("Cart updated. Please re-apply your coupon.", { icon: "⚠️" });
                setAppliedCode("");
                setPromoCode("");
                setDiscount(0);
            }

        } else if (action === "decrease") {
            if (item.quantity <= 1) return;
            dispatch(decreaseQuantity({ _id: item._id, flavor: item.flavor }));

            // Re-validate coupon if subtotal drops
            if (appliedCode) {
                toast("Cart updated. Please re-apply your coupon.", { icon: "⚠️" });
                setAppliedCode("");
                setPromoCode("");
                setDiscount(0);
            }
        }
    };

    const handleProceedToCheckout = () => {
        // Pass the applied code via URL parameters to the checkout page
        if (appliedCode) {
            router.push(`/checkout?coupon=${appliedCode}`);
        } else {
            router.push(`/checkout`);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#f8f9fa] pt-40 lg:pt-48 pb-24">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <span className=" text-slate-400 font-bold text-5xl"><TbShoppingCartQuestion /></span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Your Cart is Empty</h1>
                <p className="text-slate-500 mb-8 max-w-md text-center">Looks like you haven't added any gear to your cart yet.</p>
                <Link href="/shop" className="bg-[#ec1313] hover:bg-[#c40f0f] text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center gap-3 cursor-pointer">
                    <span className="cursor-pointer">Start Shopping</span> <FaArrowRight className="cursor-pointer" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-40 lg:pt-40 pb-24">
            <div className="max-w-[1200px] mx-auto px-4 md:px-8">

                <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
                    <div className="flex items-end gap-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
                            Your Cart
                        </h1>
                        <span className="text-xl font-medium text-slate-500 mb-1">
                            ({totalItems} items)
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            dispatch(setCart([]));
                            toast.success("Cart cleared");
                        }}
                        className="text-sm font-bold text-slate-400 hover:text-[#ec1313] transition-colors flex items-center gap-2 cursor-pointer mb-2"
                    >
                        <FaTrash size={12} className="cursor-pointer" /> <span className="cursor-pointer">Clear Cart</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    <div className="w-full lg:flex-grow flex flex-col gap-4">
                        <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr] text-sm font-bold text-slate-500 pb-2 px-2">
                            <div>Product</div>
                            <div className="text-center">Price</div>
                            <div className="text-center">Quantity</div>
                            <div className="text-right">Total</div>
                        </div>

                        {cartItems.map((item) => {
                            const stock = item.stock ?? 100;
                            const isOutOfStock = stock <= 0;

                            return (
                                <div key={`${item._id}-${item.flavor}`} className={`bg-white p-4 md:p-5 rounded-2xl shadow-sm border ${isOutOfStock ? 'border-red-200 bg-red-50/40' : 'border-slate-100'} flex flex-col md:grid md:grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 relative transition-all`}>

                                    <button
                                        onClick={() => dispatch(removeFromCart({ _id: item._id, flavor: item.flavor }))}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-[#ec1313] md:hidden cursor-pointer"
                                    >
                                        <FaTrash className="cursor-pointer" />
                                    </button>

                                    <div className="flex items-center gap-5 w-full">
                                        <Link href={`/product/${item.slug}`} className="relative w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 cursor-pointer flex items-center justify-center">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name || "Product image"} fill className={`object-contain p-2 mix-blend-multiply cursor-pointer ${isOutOfStock ? 'opacity-40 grayscale' : ''}`} />
                                            ) : (
                                                <span className="text-slate-400 text-xs font-bold text-center px-2 cursor-pointer">No Image</span>
                                            )}
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link href={`/product/${item.slug}`} className="cursor-pointer">
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight hover:text-[#ec1313] transition-colors cursor-pointer">{item.name}</h3>
                                            </Link>
                                            {item.flavor && (
                                                <p className="text-sm font-medium text-slate-500 mt-0.5">Flavor: {item.flavor}</p>
                                            )}

                                            {isOutOfStock ? (
                                                <div className="flex items-center gap-1.5 mt-2 text-[#ec1313] text-xs font-bold uppercase tracking-wider">
                                                    <FaExclamationTriangle /> Out of Stock
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 mt-2 text-green-600 text-xs font-bold uppercase tracking-wider">
                                                    <FaCheckCircle /> In Stock
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`hidden md:block text-center font-bold text-lg ${isOutOfStock ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                        ${(item.price || 0).toFixed(2)}
                                    </div>

                                    <div className="flex justify-between items-center w-full md:w-auto mt-4 md:mt-0">
                                        <div className={`md:hidden font-bold text-lg ${isOutOfStock ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                            ${(item.price || 0).toFixed(2)}
                                        </div>
                                        <div className="flex items-center justify-between border-2 border-slate-100 bg-slate-50 rounded-lg overflow-hidden h-12 w-32 mx-auto">
                                            <button
                                                onClick={() => handleQuantityChange(item, "decrease", stock)}
                                                disabled={isOutOfStock}
                                                className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-[#ec1313] hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                <FaMinus size={10} className="cursor-pointer" />
                                            </button>
                                            <span className="font-black text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item, "increase", stock)}
                                                disabled={isOutOfStock || item.quantity >= stock}
                                                className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-[#ec1313] hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                <FaPlus size={10} className="cursor-pointer" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex justify-end items-center gap-4">
                                        <div className={`font-black text-lg ${isOutOfStock ? 'text-slate-400 line-through' : 'text-[#ec1313]'}`}>
                                            ${((item.price || 0) * item.quantity).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => dispatch(removeFromCart({ _id: item._id, flavor: item.flavor }))}
                                            className="text-slate-300 hover:text-[#ec1313] transition-colors cursor-pointer"
                                            title="Remove item"
                                        >
                                            <FaTrash size={14} className="cursor-pointer" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="w-full lg:w-[400px] bg-white p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-32 flex-shrink-0">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Order Summary</h2>

                        <div className="flex flex-col gap-4 text-slate-600 font-medium mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal ({validItems.length} items)</span>
                                <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                            </div>

                            {/* --- THE MISSING UI BLOCK --- */}
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedCode})</span>
                                    <span className="font-bold">-${(discount).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span>Shipping estimate</span>
                                {shipping === 0 ? (
                                    <span className="text-green-600 font-bold">Free</span>
                                ) : (
                                    <span className="text-slate-900 font-bold">${shipping.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <span>Tax estimate</span>
                                <span className="text-slate-900 font-bold">${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Promo Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Enter code"
                                    disabled={!!appliedCode}
                                    className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-slate-400 font-medium disabled:opacity-50 cursor-text"
                                />
                                {appliedCode ? (
                                    <button
                                        onClick={() => {
                                            setAppliedCode("");
                                            setPromoCode("");
                                            setDiscount(0);
                                            toast.success("Coupon removed");
                                        }}
                                        className="bg-red-50 text-[#ec1313] px-6 py-3 rounded-lg font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                                    >
                                        <span className="cursor-pointer">Remove</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-slate-950 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        <span className="cursor-pointer">Apply</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6 flex justify-between items-end mb-4">
                            <span className="text-lg font-black text-slate-900">Order Total</span>
                            <div className="text-right">
                                <span className="text-3xl font-black text-[#ec1313] block">${total.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Includes taxes & fees</span>
                            </div>
                        </div>

                        {/* WARNING IF CART HAS INVALID ITEMS */}
                        {cartItems.length !== validItems.length && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                <FaExclamationTriangle className="text-[#ec1313] mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#ec1313] font-bold">
                                    Out of stock items have been removed from your total and will be skipped during checkout.
                                </p>
                            </div>
                        )}

                        {validItems.length > 0 ? (
                            <button
                                onClick={handleProceedToCheckout}
                                className="w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl shadow-red-500/20 active:scale-[0.98] flex justify-center items-center gap-2 mb-6 cursor-pointer"
                            >
                                <span className="cursor-pointer">Proceed to Checkout</span> <FaArrowRight size={14} className="cursor-pointer" />
                            </button>
                        ) : (
                            <button disabled className="w-full bg-slate-200 text-slate-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed flex justify-center items-center gap-2 mb-6 cursor-pointer">
                                Checkout Unavailable
                            </button>
                        )}

                        <div className="flex justify-center items-center gap-4 text-slate-300">
                            <FaCreditCard size={24} />
                            <FaPaypal size={24} />
                            <FaLock size={20} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}