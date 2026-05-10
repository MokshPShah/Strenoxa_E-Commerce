import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import UserDashboardShell from "@/components/UserDashboardShell";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import { FaArrowLeft, FaBox, FaTruck, FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaTag } from "react-icons/fa";

type Props = { params: Promise<{ id: string }> };

interface PopulatedProduct { _id: string; image?: string; images?: string[]; }
interface OrderItem { _id: string; name: string; price: number; quantity: number; flavor?: string; productId?: PopulatedProduct | null; }

export default async function OrderDetailsPage({ params }: Props) {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) redirect("/login");

    await connectDB();

    const dbUser = await User.findOne({ email: session.user.email }).select("_id")
    if (!dbUser) redirect("/login");

    const order = await Order.findOne({ _id: id, user: dbUser._id })
        .populate("items.productId", "image images")
        .lean();

    if (!order) {
        return (
            <UserDashboardShell>
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
                    <FaBox className="text-4xl text-slate-300 mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Order Not Found</h2>
                    <p className="text-slate-500 font-medium mb-6">This order does not exist or you do not have permission to view it.</p>
                    <Link href="/dashboard/orders" className="text-sm font-bold text-white bg-slate-900 px-6 py-3 rounded-xl hover:bg-black transition-colors cursor-pointer">
                        <span className="cursor-pointer">Return to Order History</span>
                    </Link>
                </div>
            </UserDashboardShell>
        )
    }

    const serializedOrder = JSON.parse(JSON.stringify(order));

    // ACCURATE INVOICE MATH
    const itemsSubtotal = (order.items as OrderItem[]).reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmt = order.discountAmount || 0;
    const shippingFee = order.shippingFee !== undefined ? order.shippingFee : (order.totalAmount > 100 ? 0 : 10);
    const taxAmt = order.taxAmount || 0;
    const orderTotal = parseFloat(order.totalAmount);
    const totalQuantity = (order.items as OrderItem[]).reduce((acc, item) => acc + item.quantity, 0);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-blue-50 text-blue-600';
            case 'Shipped': return 'bg-purple-50 text-purple-600';
            case 'Delivered': return 'bg-green-50 text-green-600';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-slate-50 text-slate-600'
        }
    }

    return (
        <UserDashboardShell>
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders" className="p-3 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                        <FaArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
                            Order <span className="text-[#ec1313]">#{id.slice(-6).toUpperCase()}</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:ml-auto">
                    <span className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>{order.status}</span>
                    <DownloadInvoiceButton order={serializedOrder} userName={session.user.name || "Customer"} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Items & Totals */}
                <div className="lg:w-2/3 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaBox className="text-[#ec1313]" />
                                <h2 className="font-black text-slate-900 uppercase tracking-tight">Purchased Items</h2>
                            </div>
                            <span className="bg-slate-50 text-slate-600 font-bold px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest border border-slate-100">
                                {totalQuantity} Items
                            </span>
                        </div>
                        <div className="p-4 sm:p-8 space-y-6">
                            {(order.items as OrderItem[]).map((item) => {
                                const productImg = item.productId?.image || item.productId?.images?.[0] || "/placeholder.png";
                                return (
                                    <div key={item._id.toString()} className="flex items-center gap-4 sm:gap-6">
                                        <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 flex-shrink-0">
                                            <img src={productImg} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.name}</h3>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Flavor: {item.flavor || 'Standard'}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                            <p className="text-xs font-medium text-slate-400 mt-1">${item.price.toFixed(2)} each</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ACCURATE FINANCIAL SUMMARY */}
                        <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100">
                            <div className="max-w-xs ml-auto space-y-3">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Subtotal</span>
                                    <span>${itemsSubtotal.toFixed(2)}</span>
                                </div>

                                {/* NEW: DISCOUNT DISPLAY */}
                                {order.appliedCoupon && (
                                    <div className="flex justify-between text-sm font-medium text-green-600">
                                        <span className="flex items-center gap-1.5"><FaTag size={10} /> Discount ({order.appliedCoupon})</span>
                                        <span>-${discountAmt.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Shipping</span>
                                    <span>{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span>
                                </div>

                                <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-slate-200 pb-3">
                                    <span>Tax</span>
                                    <span>${taxAmt.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Total Paid</span>
                                    <span className="font-black text-[#ec1313] text-xl">${orderTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping Details */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                            <FaMapMarkerAlt className="text-slate-400" />
                            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">Shipping Address</h2>
                        </div>
                        <address className="not-italic text-sm text-slate-600 font-medium space-y-1">
                            <p className="font-bold text-slate-900">{session.user.name}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip || order.shippingAddress?.zipcode}</p>
                            <p>{order.shippingAddress?.country}</p>
                        </address>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                            <FaCreditCard className="text-slate-400" />
                            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">Payment Method</h2>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                            {order.paymentMethod === 'razorpay' ? (
                                <>
                                    <FaCheckCircle className="text-2xl text-green-500" />
                                    <div>
                                        <p className="font-bold text-slate-900">Paid via Razorpay</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">ID: {order.razorpayPaymentId}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FaTruck className="text-2xl text-slate-300" />
                                    <div>
                                        <p className="font-bold text-slate-900">Cash On Delivery</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">To be collected upon arrival</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserDashboardShell>
    );
}