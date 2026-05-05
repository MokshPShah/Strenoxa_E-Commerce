"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleFavorite } from "@/store/favoriteSlice";
import { addToCart } from "@/store/cartSlice";
import { FaTrash, FaShoppingCart, FaHeartBroken, FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import UserDashboardShell from "@/components/UserDashboardShell";

export default function DashboardFavoritesPage() {
    const dispatch = useDispatch();
    const favoriteItems = useSelector((state: RootState) => state.favorites.items);
    type FavItem = typeof favoriteItems[0];

    const handleRemove = (item: FavItem) => {
        dispatch(toggleFavorite(item));
        toast.success(`${item.name} removed from favorites`);
    };

    const handleMoveToCart = (item: FavItem) => {
        dispatch(addToCart({
            ...item,
            quantity: 1,
            flavor: "Standard",
            stock: item.stock ?? 100
        }));
        dispatch(toggleFavorite(item));
        toast.success(`${item.name} moved to cart!`);
    };

    return (
        <UserDashboardShell>
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    <FaHeart className="text-[#ec1313]" /> Your Wishlist
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Manage your saved gear and move them to your cart.</p>
            </div>

            {favoriteItems.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <FaHeartBroken className="text-3xl sm:text-4xl text-slate-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">No favorites yet</h2>
                    <p className="text-sm sm:text-base text-slate-500 font-medium mb-8 max-w-md">
                        You haven't saved any items. Start exploring our premium gear and build your perfect stack!
                    </p>
                    <Link
                        href="/shop"
                        className="bg-[#ec1313] hover:bg-[#c40f0f] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer"
                    >
                        Browse Gear
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {favoriteItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group flex flex-col">
                            <Link href={`/product/${item.slug}`} className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center cursor-pointer overflow-hidden">
                                <img
                                    src={item.image || "/placeholder.png"}
                                    alt={item.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                />
                                <button
                                    onClick={(e) => { e.preventDefault(); handleRemove(item); }}
                                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-[#ec1313] hover:bg-white shadow-sm transition-all cursor-pointer z-10"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </Link>

                            <div className="p-5 flex flex-col flex-grow">
                                <Link href={`/product/${item.slug}`} className="cursor-pointer">
                                    <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight mb-1 group-hover:text-[#ec1313] transition-colors line-clamp-2 uppercase tracking-tight">
                                        {item.name}
                                    </h3>
                                </Link>
                                <p className="text-lg font-black text-slate-900 mt-auto pt-4">
                                    ${(item.price || 0).toFixed(2)}
                                </p>
                            </div>

                            <div className="p-4 pt-0">
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-slate-950 hover:bg-black shadow-md active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    <FaShoppingCart size={14} /> Move to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </UserDashboardShell>
    );
}