"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { clearCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaLock, FaTruck, FaArrowLeft } from "react-icons/fa";

export default function CheckoutPage() {
    const rawCartItems = useSelector((state: RootState) => state.cart.items);
    const cartItems = rawCartItems.filter(item => (item.stock || 0) > 0);
    const dispatch = useDispatch();
    const router = useRouter();
    const { data: session } = useSession();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Updated state to perfectly match your Mongoose Order model
    const [formData, setFormData] = useState({
        fullName: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "", // Optional, not in your DB model but good to collect
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "USA", // Default value, can be changed by user
    });

    // Send them back to shop if cart is empty
    useEffect(() => {
        if (cartItems.length === 0 && !isSubmitting) {
            router.push("/cart");
        }
    }, [cartItems, router, isSubmitting]);

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingFee = subtotal > 100 ? 0 : 10;
    const totalAmount = subtotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Note: Your backend route actually ignores the orderItems we send from the frontend 
        // and securely recalculates everything from the user.cart in the database! 
        // This is excellent for security. We just need to send the shippingAddress.

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // Perfectly matching your backend requirements
                    shippingAddress: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        zipcode: formData.zipcode,
                        country: formData.country,
                    }
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Order placed successfully!");

                window.location.href = `/checkout/success?orderId=${data.orderId || data._id}`;

                setTimeout(() => {
                    dispatch(clearCart());
                }, 100);
            } else {
                toast.error(data.message || "Failed to place order.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            toast.error("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart" className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer">
                        <FaArrowLeft size={16} />
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Secure Checkout</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Shipping Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <FaTruck className="text-[#ec1313] text-xl" />
                                <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
                            </div>

                            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                        <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                                        <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>

                                    {/* Manual Address Fields perfectly matching DB Schema */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Street Address</label>
                                        <input required type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="123 Main St, Apt 4B" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">City</label>
                                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="New York" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">State / Province</label>
                                        <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="NY" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ZIP / Postal Code</label>
                                        <input required type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} placeholder="10001" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Country</label>
                                        <select required name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] transition-all cursor-pointer">
                                            <option value="USA">United States</option>
                                            <option value="CAN">Canada</option>
                                            <option value="GBR">United Kingdom</option>
                                            <option value="AUS">Australia</option>
                                            <option value="IND">India</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={`${item._id}-${item.flavor}`} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 border border-gray-100 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-gray-500">{item.flavor} x {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-6 space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Shipping</span>
                                    <span className="font-bold text-gray-900">{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-lg pt-4 border-t border-gray-100">
                                    <span className="font-black text-gray-900 uppercase">Total</span>
                                    <span className="font-black text-[#ec1313]">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#ec1313] hover:bg-[#c40f0f] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold tracking-wide text-lg transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? "Processing..." : <><FaLock size={14} /> Place COD Order</>}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}