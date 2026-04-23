import Link from "next/link"
import { FaDumbbell, FaBolt, FaFlask, FaPills, FaTshirt, FaShoppingBag, } from "react-icons/fa"

const categoriesData = [
    { name: 'Protien', icon: FaDumbbell, href: 'shop?category=protein' },
    { name: 'Pre-Workout', icon: FaBolt, href: 'shop?category=pre-workout' },
    { name: 'Creatine', icon: FaFlask, href: 'shop?category=creatine' },
    { name: 'Vitamins', icon: FaPills, href: 'shop?category=vitamins' },
    { name: 'Apparel', icon: FaTshirt, href: 'shop?category=apparel' },
    { name: 'Accessories', icon: FaShoppingBag, href: 'shop?category=accessories' },
]

export default function Categories() {
    return (
        <>
            <section className="base-section pt-8">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="section-head">
                        Top Categories
                    </h2>
                    <Link href="/shop" className="text-[#ec1313] font-bold text-sm md:text-base hover:text-[#c40f0f] transition-colors flex items-center gap-2 border-animate">
                        See All <span className="text-lg">→</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {categoriesData.map((category, index) => (
                        <Link
                            href={category.href}
                            key={index}
                            className="style-card group"
                        >
                            {/* Icon Circle */}
                            <div className="bg-red-50 text-[#ec1313] p-5 rounded-full group-hover:bg-[#ec1313] group-hover:text-white transition-colors duration-300">
                                <category.icon size={28} />
                            </div>

                            {/* Category Name */}
                            <span className="font-bold text-slate-800 text-sm md:text-base">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    )
}