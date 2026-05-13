"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
    {
        question: "How long does shipping usually take?",
        answer: "Orders are processed within 24 hours. Standard domestic shipping takes 3-5 business days, while expedited shipping takes 1-2 business days. You will receive a tracking link via email the moment your order ships."
    },
    {
        question: "Do you offer a money-back guarantee?",
        answer: "Absolutely. We stand by our products 100%. If you are not completely satisfied with your purchase, return the unused portion within 30 days of delivery for a full refund—no questions asked."
    },
    {
        question: "Are your supplements third-party tested?",
        answer: "Yes. Every single batch is independently tested by a third-party laboratory for purity, potency, and to ensure they are 100% free of banned substances."
    },
    {
        question: "Can I stack different Strenoxa products together?",
        answer: "Yes, our products are designed to be stacked! A common and highly effective stack is our Pre-Workout before training, followed by our Premium Protein and Creatine post-workout."
    }
];

export default function FAQPage() {
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-white pb-24 pt-35">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                <div className="mb-16 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-tight mb-4">
                        Frequently Asked <span className="text-[#ec1313]">Questions</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-slate-700 tracking-tighter leading-relaxed">
                        Everything you need to know about our products, shipping, and returns.
                    </p>
                </div>

                <div className="max-w-4xl border-t border-slate-200">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-slate-100">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                                className="w-full py-6 flex justify-between items-center font-black text-slate-900 uppercase tracking-widest text-sm md:text-base text-left cursor-pointer hover:text-[#ec1313] transition-colors"
                            >
                                {faq.question}
                                <span className="text-[#ec1313] text-2xl ml-4 font-normal leading-none">
                                    {openAccordion === index ? '-' : '+'}
                                </span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openAccordion === index ? 'max-h-60 pb-8' : 'max-h-0'}`}>
                                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2">Still have a question?</h2>
                        <p className="text-slate-600 font-medium">Our support team is ready to help you out.</p>
                    </div>
                    <Link href="/contact" className="bg-[#ec1313] hover:bg-[#c40f0f] text-white px-8 h-14 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer">
                        Contact Support
                    </Link>
                </div>

            </div>
        </div>
    );
}