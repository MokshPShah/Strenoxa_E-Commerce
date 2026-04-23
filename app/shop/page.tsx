"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart } from "@/store/cartSlice";
import { toggleFavorite } from "@/store/favoriteSlice";
import { FaHeart, FaShoppingCart, FaCheck, FaFilter, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

// 1. FIX: Added `stock: number` to the interface
interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    images: string[];
    isTrending: boolean;
    stock: number; // <--- ADDED
}

function ShopContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<string>("featured");
    
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const categoryQuery = searchParams.get("category");
    const searchQuery = searchParams.get("q");
    
    const [activeCategory, setActiveCategory] = useState<string>(categoryQuery || "all");
    
    const favoriteItems = useSelector((state: RootState) => state.favorites.items);
    const cartItems = useSelector((state: RootState) => state.cart.items);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    useEffect(() => {
        if (categoryQuery) {
            setActiveCategory(categoryQuery);
        } else {
            setActiveCategory("all");
        }
    }, [categoryQuery]);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        const params = new URLSearchParams(searchParams.toString());
        if (cat === "all") {
            params.delete("category");
        } else {
            params.set("category", cat);
        }
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const clearSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ["all", ...Array.from(cats)];
    }, [products]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        if (activeCategory !== "all") {
            result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
        }

        if (searchQuery) {
            result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "featured":
            default:
                result.sort((a, b) => (a.isTrending === b.isTrending ? 0 : a.isTrending ? -1 : 1));
                break;
        }

        return result;
    }, [products, activeCategory, sortBy, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] pt-40 lg:pt-48 pb-24 flex items-center justify-center">
                <div className="text-2xl font-black uppercase tracking-widest text-slate-300 animate-pulse">
                    Loading Arsenal...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-40 lg:pt-48 pb-24">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-950 uppercase tracking-tighter mb-4">
                            {searchQuery ? `Search Results` : `Shop All Gear`}
                        </h1>
                        {searchQuery ? (
                            <div className="flex items-center gap-3">
                                <p className="text-slate-500 font-medium text-lg">
                                    Showing results for <span className="text-slate-900 font-bold">"{searchQuery}"</span>
                                </p>
                                <button 
                                    onClick={clearSearch}
                                    className="flex items-center gap-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                                >
                                    <FaTimes /> Clear Search
                                </button>
                            </div>
                        ) : (
                            <p className="text-slate-500 font-medium text-lg">
                                Fuel your potential with our highest quality supplements.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer">
                        <div className="pl-4 text-slate-400">
                            <FaFilter size={14} />
                        </div>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 py-2 pr-4 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
                        >
                            <option value="featured">Sort by: Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Alphabetical: A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer ${
                                activeCategory.toLowerCase() === cat.toLowerCase() 
                                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20" 
                                    : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                            }`}
                        >
                            {cat.replace("-", " ")}
                        </button>
                    ))}
                </div>

                {filteredAndSortedProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No products found</h2>
                        <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                        <button 
                            onClick={() => {
                                handleCategoryChange("all");
                                if (searchQuery) clearSearch();
                            }}
                            className="mt-6 text-[#ec1313] font-bold uppercase tracking-widest text-sm hover:underline cursor-pointer"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {filteredAndSortedProducts.map((product) => {
                            const isFavorited = favoriteItems.some(item => item._id === product._id);
                            const isInCart = cartItems.some(item => item._id === product._id);
                            
                            // 2. NEW: Protect quick add if out of stock
                            const isOutOfStock = product.stock <= 0;

                            return (
                                <div key={product._id} className={`group flex flex-col relative bg-white rounded-3xl p-4 shadow-sm border border-slate-100 transition-shadow hover:shadow-xl cursor-pointer ${isOutOfStock ? 'opacity-70' : ''}`}>
                                    <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-6 border border-slate-100">
                                        <div className="absolute top-4 left-4 z-20">
                                            {product.isTrending && !isOutOfStock && (
                                                <span className="bg-[#ec1313] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md shadow-red-500/30">
                                                    Hot
                                                </span>
                                            )}
                                            {isOutOfStock && (
                                                <span className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md">
                                                    Out of Stock
                                                </span>
                                            )}
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
                                            className="absolute top-4 right-4 z-20 bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform duration-300 cursor-pointer"
                                        >
                                            <FaHeart className={`w-4 h-4 transition-colors ${isFavorited ? "text-[#ec1313]" : "text-slate-300"}`} />
                                        </button>

                                        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10 flex items-center justify-center p-8 cursor-pointer">
                                            <Image 
                                                src={product.images[0]} 
                                                alt={product.name} 
                                                fill 
                                                className={`object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out p-6 ${isOutOfStock ? 'grayscale' : ''}`} 
                                            />
                                        </Link>
                                    </div>

                                    <div className="flex flex-col text-left px-2 flex-grow">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            {product.category.replace("-", " ")}
                                        </span>
                                        <Link href={`/product/${product.slug}`} className="cursor-pointer">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 hover:text-[#ec1313] transition-colors line-clamp-2 leading-snug">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center justify-between mt-auto pt-4">
                                            <p className="text-slate-900 font-black text-xl">
                                                ${product.price.toFixed(2)}
                                            </p>
                                            
                                            {isInCart ? (
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); router.push('/cart'); }}
                                                    className="w-12 h-12 bg-green-500 text-white rounded-xl flex justify-center items-center hover:bg-green-600 transition-colors cursor-pointer shadow-md shadow-green-500/20"
                                                    title="View in Cart"
                                                >
                                                    <FaCheck size={16} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if(isOutOfStock) {
                                                            toast.error("This product is currently out of stock");
                                                            return;
                                                        }
                                                        
                                                        // 3. FIX: Send the stock property when adding!
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
                                                    className="w-12 h-12 bg-slate-950 text-white rounded-xl flex justify-center items-center hover:bg-slate-800 transition-colors cursor-pointer shadow-md shadow-slate-900/20 hover:scale-105 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:hover:scale-100"
                                                    title={isOutOfStock ? "Out of Stock" : "Quick Add"}
                                                >
                                                    <FaShoppingCart size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8f9fa] pt-40 lg:pt-48 pb-24 flex items-center justify-center">
                <div className="text-2xl font-black uppercase tracking-widest text-slate-300 animate-pulse">
                    Loading Arsenal...
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}