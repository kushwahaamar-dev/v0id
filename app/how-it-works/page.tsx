"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Globe,
    ArrowLeft,
    Lock,
    Unlock,
    Zap,
    ShieldCheck,
    FileText,
    Server,
    Eye,
    Database,
} from "lucide-react";

const STEPS = [
    {
        icon: Lock,
        title: "Creator encrypts content",
        desc: "Any digital content — articles, videos, files — is encrypted and published on the web behind a ZeroGate paywall.",
        color: "text-[#F5A572]",
        bg: "bg-[#F5A572]/10",
    },
    {
        icon: Zap,
        title: "User pays with Polkadot wallet",
        desc: "One click. 0.1 PAS micro-payment goes directly to the creator's wallet. No platform cut. No middleman.",
        color: "text-[#F3B4FE]",
        bg: "bg-[#F3B4FE]/10",
    },
    {
        icon: ShieldCheck,
        title: "Smoldot verifies on-chain",
        desc: "A light client running entirely in your browser verifies the transaction against the Polkadot Relay Chain. No Infura. No Alchemy. True decentralization.",
        color: "text-[#A0FFA0]",
        bg: "bg-[#A0FFA0]/10",
    },
    {
        icon: Unlock,
        title: "Content decrypts locally",
        desc: "The decryption key is returned and stored in your browser's localStorage. The content is yours forever — even offline.",
        color: "text-[#60A5FA]",
        bg: "bg-[#60A5FA]/10",
    },
];

const WEB2_PROBLEMS = [
    { label: "Sign in with Google", issue: "Your email, reading habits, and social graph are harvested and sold to advertisers." },
    { label: "Sign in with Apple", issue: "Apple takes a 30% cut. Terms change without notice. Your access can be revoked." },
    { label: "$15/month subscription", issue: "You pay monthly for content you read once. Cancel and you lose everything." },
    { label: "Cookie consent banners", issue: "30 tracking scripts run before you read a single word. Your data funds the platform, not the creator." },
];

export default function HowItWorks() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white font-sans selection:bg-[#F3B4FE] selection:text-black">
            {/* NAV */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <Globe className="h-7 w-7 text-white" />
                    </Link>
                </div>
                <Link href="/" className="bg-[#2B1B54] hover:bg-[#3B2574] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all">
                    Back to App
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 w-full pt-16 pb-32 flex-1">
                {/* HEADER */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
                    <span className="text-[#F5A572] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 block">How It Works</span>
                    <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
                        The Old Way is Broken
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                        The internet promised creators direct access to their audience. Instead, it built a surveillance economy that extracts 30% fees, forces subscription fatigue, and harvests behavioral data at industrial scale.
                    </p>
                </motion.div>

                {/* WEB2 PROBLEMS */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-24">
                    <h2 className="text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase mb-6">What's wrong with Web2 access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {WEB2_PROBLEMS.map((p, i) => (
                            <div key={i} className="p-5 rounded-2xl border border-[#2A1111] bg-[#1A0808] group hover:border-[#4A2020] transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-2 w-2 rounded-full bg-[#FF6B6B]" />
                                    <span className="text-sm font-bold text-[#FFA0A0]">{p.label}</span>
                                </div>
                                <p className="text-zinc-500 text-sm leading-relaxed">{p.issue}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* DIVIDER */}
                <div className="flex items-center gap-6 mb-24">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="text-[10px] text-zinc-600 font-bold tracking-[0.15em] uppercase">
                        The Web3 Way
                    </span>
                    <div className="h-[1px] flex-1 bg-white/10" />
                </div>

                {/* STEPS */}
                <div className="space-y-6 mb-24">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.1 }}
                            className="flex gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.bg}`}>
                                <step.icon className={`h-6 w-6 ${step.color}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-zinc-600 text-xs font-bold">STEP {i + 1}</span>
                                    <h3 className="text-white font-bold text-lg">{step.title}</h3>
                                </div>
                                <p className="text-zinc-400 text-[15px] leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ARCHITECTURE */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] mb-24">
                    <h2 className="text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase mb-6">Technical Architecture</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center text-center gap-3 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
                                <Eye className="h-6 w-6 text-[#3B82F6]" />
                            </div>
                            <h3 className="font-bold text-sm">Browser (Next.js)</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">User interface, wallet connection, Smoldot WASM light client — all running locally in the browser.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A855F7]/10">
                                <Server className="h-6 w-6 text-[#A855F7]" />
                            </div>
                            <h3 className="font-bold text-sm">Paseo Relay Chain</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">Polkadot's testnet. Smoldot syncs block headers directly — no centralized RPC providers.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A0FFA0]/10">
                                <Database className="h-6 w-6 text-[#A0FFA0]" />
                            </div>
                            <h3 className="font-bold text-sm">localStorage</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">Decryption key persisted locally. No server stores your data. Own it forever.</p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/"
                        className="inline-flex items-center gap-3 bg-white text-black text-[17px] font-bold py-5 px-12 rounded-2xl hover:bg-zinc-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]">
                        <Unlock className="h-5 w-5" />
                        Try It Now
                    </Link>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-zinc-500 text-sm">
                        <Globe className="h-5 w-5" />
                        <span className="font-serif text-lg text-white">ZeroGate</span>
                        <span className="text-zinc-700">|</span>
                        <span>Built on Polkadot</span>
                    </div>
                    <div className="flex items-center gap-6 text-zinc-600 text-xs">
                        <span>Paseo Testnet</span>
                        <span>•</span>
                        <span>Smoldot Light Client</span>
                        <span>•</span>
                        <span>Local-First</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
