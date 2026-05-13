"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaSearch, FaBoxOpen, FaEdit, FaTrash, FaExternalLinkAlt, FaTimes, FaCheck } from "react-icons/fa";

export default function InventoryTable({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");

    // Inline Stock Editing State
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [newStockValue, setNewStockValue] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- DELETE LOGIC ---
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/inventory?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
                toast.success("Product deleted permanently");
            } else {
                toast.error("Failed to delete product");
            }
        } catch (error) {
            toast.error("An error occurred while deleting");
        }
    };

    // --- QUICK INLINE STOCK UPDATE ---
    const handleQuickStockSave = async (productId: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch("/api/admin/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, stock: newStockValue }),
            });

            if (res.ok) {
                setProducts(products.map(p => p._id === productId ? { ...p, stock: newStockValue } : p));
                toast.success("Stock updated");
                setEditingStockId(null);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const getStockDisplay = (product: any) => {
        if (editingStockId === product._id) {
            return (
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        value={newStockValue}
                        onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                        className="w-16 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ec1313]"
                    />
                    <button onClick={() => handleQuickStockSave(product._id)} disabled={isUpdating} className="text-green-600 hover:text-green-700 p-1 cursor-pointer">
                        <FaCheck size={14} />
                    </button>
                    <button onClick={() => setEditingStockId(null)} disabled={isUpdating} className="text-red-500 hover:text-red-600 p-1 cursor-pointer">
                        <FaTimes size={14} />
                    </button>
                </div>
            );
        }

        let badgeClass = "bg-red-100 text-red-700";
        let label = "Out of Stock";

        if (product.stock > 10) { badgeClass = "bg-green-100 text-green-700"; label = `In Stock (${product.stock})`; }
        else if (product.stock > 0) { badgeClass = "bg-orange-100 text-orange-700"; label = `Low Stock (${product.stock})`; }

        return (
            <button
                onClick={() => { setEditingStockId(product._id); setNewStockValue(product.stock); }}
                className={`${badgeClass} px-2 py-1 rounded text-xs font-bold cursor-pointer hover:opacity-80 border border-transparent hover:border-slate-300`}
                title="Click to quickly edit stock"
            >
                {label}
            </button>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">

            {/* Search Bar */}
            <div className="p-6 border-b border-slate-100">
                <div className="relative w-full sm:w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-slate-400"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock Level</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    <FaBoxOpen size={32} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-bold">No products found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                // FIXED: Checks for both the legacy "image" string AND the new "images" array!
                                const displayImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);

                                return (
                                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg relative overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                                                    {displayImage ? (
                                                        <Image src={displayImage} alt={product.name} fill className="object-cover mix-blend-multiply" />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">No Img</span>
                                                    )}
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="font-bold text-slate-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">ID: {product._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">{product.category.replace("-", " ")}</span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">${(product.price || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {getStockDisplay(product)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-3 text-slate-400">
                                                <Link href={`/product/${product.slug}`} target="_blank" title="View in Store" className="hover:text-blue-500 transition-colors cursor-pointer p-2"><FaExternalLinkAlt size={14} /></Link>

                                                <Link href={`/admin/inventory/edit/${product._id}`} title="Edit Full Product" className="hover:text-slate-900 transition-colors cursor-pointer p-2"><FaEdit size={16} /></Link>

                                                <button onClick={() => handleDelete(product._id)} title="Delete Product" className="hover:text-red-500 transition-colors cursor-pointer p-2"><FaTrash size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}