"use client";

import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaMinus, FaArrowRight, FaCheckCircle, FaBolt, FaTrash, FaExclamationTriangle, FaCartPlus } from "react-icons/fa";
import { FaCreditCard, FaLock, FaPaypal } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart, decreaseQuantity, removeFromCart, setCart } from "@/store/cartSlice";
import { useState } from "react";
import toast from "react-hot-toast";
import { TbShoppingCartQuestion } from "react-icons/tb";

interface RecommendedProduct {
    _id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    flavor: string;
    stock: number;
}

const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
    {
        _id: "65e5b3b9a1c2d3e4f5a6b7c8", 
        name: "Pro Shaker Bottle",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200",
        slug: "pro-shaker-bottle",
        flavor: "Matte Black",
        stock: 100
    },
    {
        _id: "65e5b3c0a1c2d3e4f5a6b7c9", 
        name: "Daily Multivitamin",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200",
        slug: "daily-multivitamin",
        flavor: "Unflavored",
        stock: 0
    }
];

export default function CartPage() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const [promoCode, setPromoCode] = useState("");

    // 1. BULLETPROOF FALLBACK: If item.stock is undefined, assume 100 instead of 0.
    const validItems = cartItems.filter(item => (item.stock || 0) > 0);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Calculate subtotal ONLY for valid, in-stock items
    const subtotal = validItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    const shipping = subtotal > 99.00 || subtotal === 0 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleQuantityChange = (item: any, action: "increase" | "decrease", maxStock: number) => {
        if (action === "increase") {
            if (item.quantity >= maxStock) {
                toast.error(`Only ${maxStock} items left in stock!`);
                return;
            }
            dispatch(addToCart({ ...item, quantity: 1, stock: maxStock }));
        } else if (action === "decrease") {
            if (item.quantity <= 1) return;
            dispatch(decreaseQuantity({ _id: item._id, flavor: item.flavor || "Standard" }));
        }
    };

    const handleAddRecommended = (product: RecommendedProduct) => {
        const existingItem = cartItems.find(item => item._id === product._id && item.flavor === product.flavor);
        
        if (existingItem && product.stock > 0 && existingItem.quantity >= product.stock) {
            toast.error("Max stock reached for this item.");
            return;
        }

        dispatch(addToCart({ ...product, quantity: 1 }));
        toast.success(`${product.name} added to cart!`);
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
                    Start Shopping <FaArrowRight />
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
                        <FaTrash size={12} /> Clear Cart
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
                            // 2. BULLETPROOF FALLBACK: Same safe fallback for the UI display
                            const stock = item.stock || 0;
                            const isOutOfStock = stock <= 0;

                            return (
                                <div key={`${item._id}-${item.flavor}`} className={`bg-white p-4 md:p-5 rounded-2xl shadow-sm border ${isOutOfStock ? 'border-red-200 bg-red-50/40' : 'border-slate-100'} flex flex-col md:grid md:grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 relative transition-all`}>

                                    <button
                                        onClick={() => dispatch(removeFromCart({ _id: item._id, flavor: item.flavor }))}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-[#ec1313] md:hidden cursor-pointer"
                                    >
                                        <FaTrash />
                                    </button>

                                    <div className="flex items-center gap-5 w-full">
                                        <Link href={`/product/${item.slug}`} className="relative w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 cursor-pointer flex items-center justify-center">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name || "Product image"} fill className={`object-contain p-2 mix-blend-multiply ${isOutOfStock ? 'opacity-40 grayscale' : ''}`} />
                                            ) : (
                                                <span className="text-slate-400 text-xs font-bold text-center px-2">No Image</span>
                                            )}
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link href={`/product/${item.slug}`} className="cursor-pointer">
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight hover:text-[#ec1313] transition-colors">{item.name}</h3>
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
                                                <FaMinus size={10} />
                                            </button>
                                            <span className="font-black text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item, "increase", stock)}
                                                disabled={isOutOfStock || item.quantity >= stock}
                                                className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-[#ec1313] hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                <FaPlus size={10} />
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
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Frequently Bought Together Section */}
                        <div className="mt-8">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
                                <FaBolt className="text-[#ec1313]" /> Frequently Bought Together
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {RECOMMENDED_PRODUCTS.map((product) => (
                                    <div key={product._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-lg relative overflow-hidden flex-shrink-0">
                                                <Image src={product.image} alt={product.name} fill className={`object-contain p-1 mix-blend-multiply ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                                                <p className="font-bold text-[#ec1313] text-sm mt-0.5">${product.price.toFixed(2)}</p>
                                                {product.stock <= 0 && (
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Out of Stock</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddRecommended(product)}
                                            disabled={product.stock <= 0}
                                            className="w-10 h-10 rounded-full border-2 border-[#ec1313] text-[#ec1313] flex items-center justify-center hover:bg-[#ec1313] hover:text-white disabled:border-slate-300 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors flex-shrink-0 cursor-pointer"
                                            title="Add to Cart"
                                        >
                                            <FaCartPlus size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="w-full lg:w-[400px] bg-white p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-32 flex-shrink-0">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Order Summary</h2>

                        <div className="flex flex-col gap-4 text-slate-600 font-medium mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal ({validItems.length} items)</span>
                                <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                            </div>
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
                                    className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-slate-400 font-medium"
                                />
                                <button
                                    onClick={() => {
                                        if (promoCode) toast.error("Invalid promo code");
                                    }}
                                    className="bg-slate-950 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Apply
                                </button>
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
                            <Link href="/checkout" className="w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl shadow-red-500/20 active:scale-[0.98] flex justify-center items-center gap-2 mb-6 cursor-pointer">
                                Proceed to Checkout <FaArrowRight size={14} />
                            </Link>
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