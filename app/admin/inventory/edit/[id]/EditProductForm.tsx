"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

export default function EditProductForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: initialData.name,
        slug: initialData.slug,
        desc: initialData.desc,
        price: initialData.price,
        category: initialData.category,
        stock: initialData.stock,
        inStock: initialData.inStock,
        isTrending: initialData.isTrending || false,
        rating: initialData.rating || 0,
        reviewCount: initialData.reviewCount || 0,
        longDesc: initialData.longDesc,
        flavors: initialData.flavors,
        images: initialData.images,
        supplementFacts: initialData.supplementFacts
    });

    const [newImageUrl, setNewImageUrl] = useState("");

    // DYNAMIC UI LOGIC (Same as Add Product)
    const isApparel = formData.category === "apparel" || formData.category === "accessories";
    const variantLabel = isApparel ? "Sizes" : "Flavors";
    const variantSingular = isApparel ? "Size" : "Flavor";
    const variantPlaceholder = isApparel ? "Select a size..." : "e.g., Double Chocolate, Vanilla";

    const updateArray = (path: 'paragraphs' | 'bullets' | 'flavors', index: number, value: string) => {
        const newData = { ...formData };
        if (path === 'flavors') newData.flavors[index] = value;
        else newData.longDesc[path][index] = value;
        setFormData(newData);
    };

    const addArrayItem = (path: 'paragraphs' | 'bullets' | 'flavors') => {
        const newData = { ...formData };
        if (path === 'flavors') newData.flavors.push("");
        else newData.longDesc[path].push("");
        setFormData(newData);
    };

    const removeArrayItem = (path: 'paragraphs' | 'bullets' | 'flavors', index: number) => {
        const newData = { ...formData };
        if (path === 'flavors') newData.flavors.splice(index, 1);
        else newData.longDesc[path].splice(index, 1);
        setFormData(newData);
    };

    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
            setNewImageUrl("");
        }
    };

    // Full Update Handler
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/admin/inventory/${initialData._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Product updated successfully!");
                router.push("/admin/inventory");
                router.refresh(); // Force Next.js to re-fetch the server cache
            } else {
                toast.error("Failed to update product.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <Link href="/admin/inventory" className="text-sm font-bold text-slate-400 hover:text-[#ec1313] transition-colors flex items-center gap-2 mb-4 cursor-pointer w-fit">
                    <FaArrowLeft /> Back to Inventory
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Product: {initialData.name}</h1>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-8">
                {/* 1. BASIC INFO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-slate-400" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">URL Slug</label>
                            <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2 mt-1 focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Short Description</label>
                        <textarea required value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-slate-400 h-20" />
                    </div>
                </div>

                {/* 2. PRICE & METRICS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">Pricing & Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                            <input type="number" step="0.01" required value={formData.price || ''} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-lg px-4 py-2 mt-1 font-bold text-[#ec1313] focus:outline-none focus:border-slate-400" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400 cursor-pointer">
                                <option value="protein">Protein</option>
                                <option value="pre-workout">Pre-Workout</option>
                                <option value="creatine">Creatine</option>
                                <option value="apparel">Apparel</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({ ...formData, inStock: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                                In Stock
                            </label>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({ ...formData, isTrending: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                                Trending
                            </label>
                        </div>
                    </div>
                </div>

                {/* 3. IMAGES */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">Product Images</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="url" placeholder="Paste image URL..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-grow border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" />
                        <button type="button" onClick={handleAddImage} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors">
                            <FaPlus /> Add URL
                        </button>
                    </div>
                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {formData.images.map((imgUrl: string, index: number) => (
                                <div key={index} className="relative group border border-slate-200 rounded-xl overflow-hidden aspect-square bg-slate-50">
                                    <Image src={imgUrl} alt={`Preview ${index}`} fill className="object-cover" />
                                    <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_: string, i: number) => i !== index) })} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DYNAMIC VARIANTS (FLAVORS OR SIZES) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">Available {variantLabel}</h2>
                    {formData.flavors.map((f: string | number | readonly string[] | undefined, index: number) => (
                        <div key={`f-${index}`} className="flex gap-2">
                            {isApparel ? (
                                <select
                                    value={f}
                                    onChange={e => updateArray('flavors', index, e.target.value)}
                                    className="flex-grow md:max-w-md border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400 cursor-pointer"
                                >
                                    <option value="" disabled>Select a size...</option>
                                    <option value="XXS">XXS</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                </select>
                            ) : (
                                <input type="text" value={f} onChange={e => updateArray('flavors', index, e.target.value)} className="flex-grow md:max-w-md border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" placeholder={variantPlaceholder} />
                            )}
                            <button type="button" onClick={() => removeArrayItem('flavors', index)} className="text-red-500 hover:text-red-700 p-3 bg-red-50 rounded-lg cursor-pointer transition-colors">
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('flavors')} className="text-sm font-bold text-[#ec1313] flex items-center gap-1 hover:underline cursor-pointer w-fit mt-1">
                        <FaPlus size={10} /> Add {variantSingular}
                    </button>
                </div>

                {/* 4. SUPPLEMENT FACTS (Hidden if Apparel) */}
                {!isApparel && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                        <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">Supplement Facts</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Serving Size</label>
                                <input type="text" placeholder="e.g., 1 Scoop (30g)" value={formData.supplementFacts?.servingSize || ''} onChange={e => setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, servingSize: e.target.value } })} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Servings Per Container</label>
                                <input type="number" value={formData.supplementFacts?.servingsPerContainer || ''} onChange={e => setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, servingsPerContainer: parseInt(e.target.value) || 0 } })} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" />
                            </div>
                        </div>

                        <label className="text-xs font-bold text-slate-500 uppercase mt-2">Active Ingredients</label>
                        <div className="flex flex-col gap-3">
                            {formData.supplementFacts?.ingredients?.map((ing: any, idx: number) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                    <input type="text" placeholder="Ingredient" value={ing.name} onChange={e => {
                                        const newIngs = [...formData.supplementFacts.ingredients]; newIngs[idx].name = e.target.value;
                                        setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, ingredients: newIngs } });
                                    }} className="flex-grow w-full sm:w-auto border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" />
                                    <input type="text" placeholder="Amount" value={ing.amount} onChange={e => {
                                        const newIngs = [...formData.supplementFacts.ingredients]; newIngs[idx].amount = e.target.value;
                                        setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, ingredients: newIngs } });
                                    }} className="w-full sm:w-32 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" />
                                    <input type="text" placeholder="% DV (e.g., 50%)" value={ing.dailyValue} onChange={e => {
                                        const newIngs = [...formData.supplementFacts.ingredients]; newIngs[idx].dailyValue = e.target.value;
                                        setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, ingredients: newIngs } });
                                    }} className="w-full sm:w-28 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-slate-400" />
                                    <button type="button" onClick={() => {
                                        const newIngs = formData.supplementFacts.ingredients.filter((_: any, i: number) => i !== idx);
                                        setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, ingredients: newIngs } });
                                    }} className="text-red-500 hover:text-red-700 p-3 bg-red-50 rounded-lg cursor-pointer transition-colors w-full sm:w-auto flex justify-center mt-1 sm:mt-0">
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => setFormData({ ...formData, supplementFacts: { ...formData.supplementFacts, ingredients: [...(formData.supplementFacts?.ingredients || []), { name: "", amount: "", dailyValue: "" }] } })} className="text-sm font-bold text-[#ec1313] flex items-center gap-1 hover:underline cursor-pointer w-fit mt-2">
                            <FaPlus size={10} /> Add Ingredient
                        </button>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="bg-[#ec1313] hover:bg-[#c40f0f] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2">
                        {isSubmitting ? "Saving Changes..." : "Update Product"}
                    </button>
                </div>
            </form>
        </>
    );
}