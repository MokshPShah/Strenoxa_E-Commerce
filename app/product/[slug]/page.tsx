"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaShoppingCart, FaSpinner, FaMinus, FaPlus, FaHeart, FaStar, FaCheck, FaCreditCard } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toggleFavorite } from "@/store/favoriteSlice";
import { RootState } from "@/store/store";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProductData {
    _id: string;
    name: string;
    slug: string;
    desc: string;
    longDesc?: { paragraphs: string[]; bullets: string[] };
    rating?: number;
    reviewCount?: number;
    supplementFacts?: {
        servingSize: string;
        servingsPerContainer: number;
        ingredients: { name: string; amount: string; dailyValue: string; }[];
    };
    price: number;
    category: string;
    flavors: string[];
    images: string[];
    stock: number;
    inStock: boolean;
}

export default function ProductPage() {
    const params = useParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const [product, setProduct] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFlavor, setSelectedFlavor] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string>("");
    const [openAccordion, setOpenAccordion] = useState<string>("use");

    const favoriteItems = useSelector((state: RootState) => state.favorites.items);
    const cartItems = useSelector((state: RootState) => state.cart.items);

    const isFavorited = product ? favoriteItems.some(item => item._id === product._id) : false;
    const isInCart = product ? cartItems.some(item => item._id === product._id && item.flavor === selectedFlavor) : false;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const resolvedParams = await params;
                const res = await fetch(`/api/products/${resolvedParams.slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    if (data.images && data.images.length > 0) setActiveImage(data.images[0]);
                    if (data.flavors && data.flavors.length > 0) setSelectedFlavor(data.flavors[0]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params]);

    const handleAddToCart = () => {
        if (!product) return;
        // It MUST look like this:
        dispatch(addToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            slug: product.slug,
            flavor: selectedFlavor,
            stock: product.stock
        }))
        toast.success(`${quantity}x ${product.name} (${selectedFlavor}) added!`);
    };

    const handleBuyNow = () => {
        if (!isInCart) handleAddToCart();
        router.push('/cart');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-[#ec1313] text-4xl" /></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-2xl font-black uppercase text-slate-900">Product not found.</div>;

    return (
        <div className="min-h-screen bg-white pb-24 pt-8">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
                    <Link href="/" className="hover:text-[#ec1313] transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-[#ec1313] transition-colors">Shop</Link>
                    <span>/</span>
                    <span className="text-slate-900">{product.category.replace("-", " ")}</span>
                    <span>/</span>
                    <span className="text-slate-900">{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 mb-24">
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="relative aspect-square bg-slate-50 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-100">
                            <Image src={activeImage} alt={product.name} fill className="object-contain p-8 mix-blend-multiply" priority />
                        </div>
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-slate-50 ${activeImage === img ? 'border-[#ec1313]' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <Image src={img} alt="thumbnail" fill className="object-contain p-2 mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col py-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-tight mb-4">
                            {product.name}
                        </h1>

                        {product.reviewCount !== undefined && product.reviewCount > 0 && (
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center text-[#ec1313] gap-1">
                                    <span className="text-slate-900 font-black mr-1">{product.rating}</span>
                                    <FaStar />
                                </div>
                                <span className="text-slate-300 text-sm">|</span>
                                <span className="text-slate-500 text-sm font-bold underline decoration-slate-200 underline-offset-4">{product.reviewCount} Reviews</span>
                            </div>
                        )}

                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-4xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                            <span className="text-lg font-bold text-slate-400 line-through mb-1">${(product.price * 1.2).toFixed(2)}</span>
                        </div>

                        {product.flavors && product.flavors.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-3">Flavor</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.flavors.map((flavor) => (
                                        <button
                                            key={flavor}
                                            onClick={() => setSelectedFlavor(flavor)}
                                            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedFlavor === flavor
                                                ? "border-[#ec1313] bg-red-50 text-[#ec1313]"
                                                : "border-slate-100 text-slate-500 hover:border-slate-300 bg-white"
                                                }`}
                                        >
                                            {flavor}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-3">Quantity</h3>
                            <div className="flex items-center justify-between border-2 border-slate-100 bg-slate-50 rounded-xl h-14 px-2 w-36">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-[#ec1313] p-3"><FaMinus size={12} /></button>
                                <span className="font-black text-slate-900">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-[#ec1313] p-3"><FaPlus size={12} /></button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mb-8">
                            <div className="flex gap-3">
                                {isInCart ? (
                                    <button
                                        onClick={() => router.push('/cart')}
                                        className="flex-grow bg-green-500 hover:bg-green-600 text-white h-14 rounded-xl font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-3"
                                    >
                                        <FaCheck size={16} /> Go to Cart
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock}
                                        className="flex-grow bg-[#ec1313] hover:bg-[#c40f0f] text-white h-14 rounded-xl font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-3 disabled:bg-slate-200 disabled:text-slate-400"
                                    >
                                        <FaShoppingCart size={16} /> {product.inStock ? "Add to Cart" : "Out of Stock"}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        dispatch(toggleFavorite({
                                            _id: product._id, name: product.name, price: product.price, image: product.images[0], slug: product.slug
                                        }));
                                        if (isFavorited) toast('Removed from favorites', { icon: '💔' });
                                        else toast.success('Added to favorites!');
                                    }}
                                    className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-colors bg-white ${isFavorited ? 'border-red-100 bg-red-50' : 'border-slate-100 hover:border-slate-300'}`}
                                >
                                    <FaHeart size={20} className={isFavorited ? "text-[#ec1313]" : "text-slate-300"} />
                                </button>
                            </div>

                            <button
                                onClick={handleBuyNow}
                                disabled={!product.inStock}
                                className="w-full bg-slate-950 hover:bg-slate-800 text-white h-14 rounded-xl font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-3 disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                <FaCreditCard size={16} /> Buy It Now
                            </button>
                        </div>

                        <div className="mt-4 border-t border-slate-100">
                            {['use', 'shipping', 'quality'].map((acc) => (
                                <div key={acc} className="border-b border-slate-100">
                                    <button
                                        onClick={() => setOpenAccordion(openAccordion === acc ? '' : acc)}
                                        className="w-full py-5 flex justify-between items-center font-black text-slate-900 uppercase tracking-widest text-xs"
                                    >
                                        {acc === 'use' ? 'Suggested Use' : acc === 'shipping' ? 'Shipping & Returns' : 'The Strenoxa Guarantee'}
                                        <span className="text-[#ec1313] text-lg">{openAccordion === acc ? '-' : '+'}</span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ${openAccordion === acc ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                            {acc === 'use' && "Mix 1 scoop with 6-8 oz of cold water or your favorite beverage. Consume 20-30 minutes before your workout. Do not exceed 2 scoops in a 24-hour period."}
                                            {acc === 'shipping' && "Free standard shipping on all orders over $100. Unopened products can be returned within 30 days of purchase for a full refund."}
                                            {acc === 'quality' && "Every batch is third-party tested for purity and banned substances. We manufacture in a cGMP certified facility right here in the USA."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-16 flex flex-col lg:flex-row gap-16">
                    <div className="w-full lg:w-2/3">
                        <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-8">Product Overview</h2>
                        {product.longDesc?.paragraphs.map((p, i) => (
                            <p key={i} className="text-slate-600 text-lg leading-relaxed mb-6">{p}</p>
                        ))}
                        {product.longDesc?.bullets && product.longDesc.bullets.length > 0 && (
                            <ul className="mt-8 space-y-4">
                                {product.longDesc.bullets.map((bullet, i) => (
                                    <li key={i} className="flex items-start text-slate-600 text-lg">
                                        <span className="text-[#ec1313] mr-4 mt-1">●</span>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="w-full lg:w-1/3">
                        {product.supplementFacts && (
                            <div className="bg-white p-8 rounded-3xl border-4 border-slate-950 shadow-xl">
                                <h2 className="text-3xl font-black text-slate-950 border-b-8 border-slate-950 pb-2 mb-4">Supplement Facts</h2>
                                <div className="flex justify-between text-base font-bold text-slate-700 mb-2">
                                    <span>Serving Size:</span>
                                    <span>{product.supplementFacts.servingSize}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-slate-700 border-b-4 border-slate-950 pb-4 mb-4">
                                    <span>Servings Per Container:</span>
                                    <span>{product.supplementFacts.servingsPerContainer}</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-slate-950 uppercase border-b-2 border-slate-200 pb-2 mb-4">
                                    <span>Amount Per Serving</span>
                                    <span>% Daily Value</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {product.supplementFacts.ingredients.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-base border-b border-slate-100 pb-3">
                                            <span className="font-bold text-slate-900">{item.name} <span className="text-slate-500 font-normal ml-2">{item.amount}</span></span>
                                            <span className="font-bold text-slate-900">{item.dailyValue}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-6 leading-relaxed">
                                    * The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice. ** Daily Value not established.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}