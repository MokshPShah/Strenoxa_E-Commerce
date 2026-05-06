"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart } from "@/store/cartSlice";
import { toggleFavorite } from "@/store/favoriteSlice";
import { FaHeart, FaShoppingCart, FaCheck, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    images: string[];
    isTrending: boolean;
    stock: number;
}

export default function Trending() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const router = useRouter();

    const favoriteItems = useSelector((state: RootState) => state.favorites.items);
    const cartItems = useSelector((state: RootState) => state.cart.items);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/products?trending=true');
                const data = await res.json();

                // ✅ THE FIX: Correctly check for and extract data.products
                if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (Array.isArray(data)) {
                    // Fallback just in case
                    setProducts(data);
                } else {
                    console.error("API Error or Invalid Data:", data);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Fetch failed:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (loading) {
        return <div className="py-24 text-center font-black uppercase tracking-widest text-slate-300 animate-pulse">Loading Trending Gear...</div>;
    }

    if (!Array.isArray(products) || products.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter">Trending Now</h2>
                        <p className="text-slate-500 font-medium mt-2">The highest performing gear this week.</p>
                    </div>
                    <Link href="/shop" className="hidden md:flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-sm hover:text-[#ec1313] transition-colors cursor-pointer">
                        View All <FaArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {Array.isArray(products) && products.map((product) => {
                        const isFavorited = favoriteItems.some(item => item._id === product._id);
                        const isInCart = cartItems.some(item => item._id === product._id);

                        const isOutOfStock = (product.stock || 0) <= 0;

                        return (
                            <div key={product._id} className="group flex flex-col relative">
                                <div className="relative aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden mb-5 border border-slate-100">
                                    <div className="absolute top-3 left-3 z-20">
                                        <div className="absolute top-4 left-4 z-20">
                                            {isOutOfStock ? (
                                                <span className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md">
                                                    Out of Stock
                                                </span>
                                            ) : product.isTrending && (
                                                <span className="bg-[#ec1313] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md shadow-red-500/30">
                                                    Hot
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            dispatch(toggleFavorite({
                                                _id: product._id, name: product.name, price: product.price, image: product.images[0] || "", slug: product.slug
                                            }));
                                            if (isFavorited) {
                                                toast('Removed from favorites', { icon: '💔' });
                                            } else {
                                                toast.success('Added to favorites!');
                                            }
                                        }}
                                        className="absolute top-3 right-3 z-20 bg-white p-2.5 rounded-full shadow-sm hover:scale-110 transition-transform duration-300 cursor-pointer"
                                    >
                                        <FaHeart className={`w-4 h-4 transition-colors ${isFavorited ? "text-[#ec1313]" : "text-slate-300"}`} />
                                    </button>

                                    <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10 flex items-center justify-center p-8 cursor-pointer">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className={`object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out p-6 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                                        />
                                    </Link>

                                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
                                        {isInCart ? (
                                            <button
                                                onClick={() => router.push('/cart')}
                                                className="w-full bg-green-500 text-white font-black uppercase tracking-widest text-xs py-4 flex justify-center items-center gap-2 hover:bg-green-600 transition-colors cursor-pointer"
                                            >
                                                <FaCheck size={14} /> View in Cart
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    if (isOutOfStock) {
                                                        toast.error("This product is currently out of stock");
                                                        return;
                                                    }

                                                    dispatch(addToCart({
                                                        _id: product._id,
                                                        name: product.name,
                                                        price: product.price,
                                                        image: product.images[0] || "",
                                                        slug: product.slug,
                                                        quantity: 1,
                                                        stock: product.stock
                                                    }));
                                                    toast.success(`${product.name} added!`);
                                                }}
                                                disabled={isOutOfStock}
                                                className="w-full bg-[#ec1313] text-white font-black uppercase tracking-widest text-xs py-4 flex justify-center items-center gap-2 hover:bg-[#c40f0f] transition-colors cursor-pointer disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            >
                                                <FaShoppingCart size={14} /> {isOutOfStock ? "Out of Stock" : "Quick Add"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col text-left px-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        {product.category?.replace("-", " ")}
                                    </span>
                                    <Link href={`/product/${product.slug}`} className="cursor-pointer">
                                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1 hover:text-[#ec1313] transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-slate-900 font-bold text-sm">
                                        ${product.price?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}