"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleFavorite } from "@/store/favoriteSlice";
import { addToCart, decreaseQuantity } from "@/store/cartSlice";
import { FaHeart, FaRegHeart, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    slug: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  const isFavorite = favorites.some((fav) => fav._id === product._id);
  
  // REAL-TIME CART TRACKING
  const cartItem = cartItems.find((item) => item._id === product._id);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = (product.stock || 0) <= 0;
  const isMaxStockReached = currentQuantity >= (product.stock || 0);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    dispatch(toggleFavorite({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0] || "",
      slug: product.slug
    }));
    
    if (isFavorite) {
        toast('Removed from favorites', { icon: '💔' });
    } else {
        toast.success('Added to favorites!');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
        toast.error("This product is currently out of stock");
        return;
    }
    
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0] || "",
      slug: product.slug,
      quantity: 1,
      stock: product.stock
    }));
    toast.success(`${product.name} added!`);
  };

  const handleIncrease = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isMaxStockReached) {
          toast.error(`Only ${product.stock} available in stock`);
          return;
      }
      dispatch(addToCart({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0] || "",
          slug: product.slug,
          quantity: 1,
          stock: product.stock
      }));
  };

  const handleDecrease = (e: React.MouseEvent) => {
      e.preventDefault();
      if (cartItem) {
          dispatch(decreaseQuantity({ _id: product._id, flavor: cartItem.flavor }));
      }
  };

  return (
    <div className="relative group rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      
      {/* Stock Overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {isOutOfStock && (
              <span className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-sm">
                  Out of Stock
              </span>
          )}
      </div>

      <button
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-50 hover:scale-110 transition-transform cursor-pointer"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? (
          <FaHeart className="w-4 h-4 text-[#ec1313] transition-transform active:scale-75" />
        ) : (
          <FaRegHeart className="w-4 h-4 text-slate-300 hover:text-[#ec1313] transition-colors active:scale-75" />
        )}
      </button>

      {/* Product Image */}
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden border-b border-slate-100">
        <Link href={`/product/${product.slug}`} className="cursor-pointer block h-full w-full">
          <img 
            src={product.image || product.images?.[0] || "/placeholder.png"} 
            alt={product.name}
            className={`w-full h-full object-contain p-8 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
        </Link>

        {/* Hover Action / Interactive Quantity Selector */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            {isInCart ? (
                <div className="w-full bg-slate-950 text-white font-black uppercase text-[11px] tracking-widest h-14 flex justify-between items-center px-1 shadow-lg">
                    <button 
                        onClick={handleDecrease} 
                        className="w-12 h-full flex justify-center items-center hover:text-[#ec1313] transition-colors cursor-pointer active:scale-95"
                        aria-label="Decrease quantity"
                    >
                        <FaMinus size={12} />
                    </button>
                    <span className="flex-grow text-center tracking-widest">{currentQuantity} IN CART</span>
                    <button 
                        onClick={handleIncrease} 
                        disabled={isMaxStockReached}
                        className="w-12 h-full flex justify-center items-center hover:text-[#ec1313] transition-colors cursor-pointer active:scale-95 disabled:opacity-30 disabled:hover:text-white disabled:active:scale-100"
                        aria-label="Increase quantity"
                    >
                        <FaPlus size={12} />
                    </button>
                </div>
            ) : (
                <button 
                  onClick={handleQuickAdd}
                  disabled={isOutOfStock}
                  className="w-full bg-slate-950 text-white font-black uppercase text-[11px] tracking-widest h-14 flex justify-center items-center gap-2 hover:bg-black transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg"
                >
                    <FaShoppingCart size={14} /> {isOutOfStock ? "Out of Stock" : "Quick Add"}
                </button>
            )}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-5 bg-white">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Gear</span>
        <Link href={`/product/${product.slug}`} className="block mt-1 cursor-pointer">
          <h3 className="font-black text-slate-900 tracking-tight line-clamp-1 uppercase group-hover:text-[#ec1313] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
            <p className="font-black text-[#ec1313] text-lg">${product.price.toFixed(2)}</p>
        </div>
      </div>
      
    </div>
  );
}