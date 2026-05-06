"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaTrash, FaMinus, FaPlus, FaLock, FaShoppingBag, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

// If you are using Redux, you would import useSelector/useDispatch here. 
// For this component, we will sync directly with your new MongoDB API.

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Fetch cart from DB when drawer opens
    useEffect(() => {
        if (isOpen) fetchCart();
    }, [isOpen]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/cart');
            const data = await res.json();
            if (res.ok) setCartItems(data.cart || []);
        } catch (error) {
            toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId: string, flavor: string, amount: number, currentQty: number) => {
        if (currentQty + amount < 1) return; // Prevent 0 or negative quantities

        setUpdatingId(productId);
        try {
            // Optimistic UI update for instant feedback
            setCartItems(prev => prev.map(item =>
                (item.productId._id === productId && item.flavor === flavor)
                    ? { ...item, quantity: item.quantity + amount }
                    : item
            ));

            const res = await fetch('/api/user/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: amount, flavor }), // amount is +1 or -1
            });

            if (!res.ok) throw new Error("Failed to update");
        } catch (error) {
            toast.error("Failed to update quantity");
            fetchCart(); // Revert on failure
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemoveItem = async (cartItemId: string) => {
        setUpdatingId(cartItemId);
        try {
            // Optimistic UI update
            setCartItems(prev => prev.filter(item => item._id !== cartItemId));

            const res = await fetch(`/api/user/cart?id=${cartItemId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to remove item");
            toast.success("Item removed");
        } catch (error) {
            toast.error("Failed to remove item");
            fetchCart(); // Revert on failure
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    // Calculate Subtotal (assuming populated productId has a 'price' field)
    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.productId?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    // Handle click outside to close
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
            {/* Dark Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-out Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <FaShoppingBag className="text-[#ec1313]" /> Your Cart
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-[#ec1313] transition-colors rounded-full hover:bg-red-50 cursor-pointer">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Cart Items Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <FaSpinner className="animate-spin text-3xl text-[#ec1313]" />
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <FaShoppingBag className="text-4xl text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Your cart is empty</h3>
                            <p className="text-sm text-slate-500 font-medium">Looks like you haven't added any gear yet.</p>
                            <button onClick={onClose} className="mt-4 text-xs font-black uppercase tracking-widest text-[#ec1313] hover:underline cursor-pointer">
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item._id} className={`flex gap-4 group ${updatingId === item._id || updatingId === item.productId._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* Image */}
                                <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 flex-shrink-0">
                                    <img src={item.productId?.image || "/placeholder.png"} alt={item.productId?.name} className="w-full h-full object-contain" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 leading-tight">
                                                {item.productId?.name || "Product Unavailable"}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-bold mt-1">Flavor: {item.flavor}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item._id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId._id, item.flavor, -1, item.quantity)}
                                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-black transition-colors cursor-pointer"
                                            >
                                                <FaMinus size={10} />
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId._id, item.flavor, 1, item.quantity)}
                                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-black transition-colors cursor-pointer"
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                        </div>
                                        {/* Price */}
                                        <p className="font-black text-sm text-slate-900">
                                            ${((item.productId?.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout Button */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Subtotal</span>
                            <span className="font-black text-lg text-slate-900">${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium text-center">Shipping and taxes calculated at checkout.</p>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-[#ec1313] hover:bg-[#c40f0f] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaLock /> Secure Checkout
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}