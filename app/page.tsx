"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Globe,
  Search,
  Moon,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { unlockContent } from "@/lib/papi";

// Puzzle grid: 9 pieces of a single image, each showing its own slice
const PUZZLE_PIECES = [
  { row: 0, col: 0, scrambleRotate: 12, scrambleX: -8, scrambleY: 6 },
  { row: 0, col: 1, scrambleRotate: -15, scrambleX: 5, scrambleY: -10 },
  { row: 0, col: 2, scrambleRotate: 8, scrambleX: -12, scrambleY: 4 },
  { row: 1, col: 0, scrambleRotate: -10, scrambleX: 7, scrambleY: -5 },
  { row: 1, col: 1, scrambleRotate: 18, scrambleX: -6, scrambleY: 8 },
  { row: 1, col: 2, scrambleRotate: -12, scrambleX: 10, scrambleY: -7 },
  { row: 2, col: 0, scrambleRotate: 14, scrambleX: -9, scrambleY: -4 },
  { row: 2, col: 1, scrambleRotate: -8, scrambleX: 4, scrambleY: 12 },
  { row: 2, col: 2, scrambleRotate: 11, scrambleX: -5, scrambleY: -8 },
];

const STORAGE_KEY = "zerogate_decryption_key";

export default function Page() {
  const [decryptionKey, setDecryptionKey] = useState<string | null>(null);
  const [status, setStatus] = useState<"connect" | "unlock" | "decrypting">("connect");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type?: string }[]>([]);

  const { address, signer, accounts, showAccounts, error, connect, selectAccount, disconnect } = WalletConnect();

  // Restore unlock state from localStorage only when wallet is connected
  useEffect(() => {
    if (address) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setDecryptionKey(stored);
      } catch { }
    } else {
      // Wallet disconnected — re-lock
      setDecryptionKey(null);
    }
  }, [address]);

  useEffect(() => {
    if (address && signer && status === "connect") setStatus("unlock");
  }, [address, signer, status]);

  const onToast = useCallback((msg: string, type?: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!address || !signer) { if (!showAccounts) connect(); return; }
    setIsUnlocking(true);
    setStatus("decrypting");
    onToast("Broadcasting transaction to Paseo…", "info");
    try {
      const txHash = await unlockContent(address, signer);
      onToast("Transaction finalized on-chain ✓", "success");
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Verification failed");
      try { localStorage.setItem(STORAGE_KEY, data.decryptionKey); } catch { }
      onToast("Content decrypted. Welcome to ZeroGate.", "success");
      setDecryptionKey(data.decryptionKey);
    } catch (err: any) {
      onToast(err instanceof Error ? err.message : String(err), "error");
      setStatus("unlock");
    } finally {
      setIsUnlocking(false);
    }
  }, [address, signer, showAccounts, connect, onToast]);

  const isUnlocked = !!decryptionKey;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans selection:bg-[#F3B4FE] selection:text-black">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-6">
          <Globe className="h-8 w-8 text-white" />
          <div className="hidden md:flex items-center gap-2 bg-[#1A1A1A] rounded-lg px-3 py-2 w-64 border border-white/10">
            <Search className="h-4 w-4 text-zinc-500" />
            <span className="text-zinc-500 text-sm font-medium">Search (⌘K)</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/how-it-works" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors hidden md:block">
            How It Works
          </Link>
          <Moon className="h-5 w-5 text-zinc-500 cursor-pointer hover:text-white transition-colors" />
          <div className="relative">
            {address ? (
              <button onClick={() => { localStorage.removeItem(STORAGE_KEY); disconnect(); setDecryptionKey(null); setStatus("connect"); }}
                className="bg-[#3A1818] hover:bg-[#4A2020] text-[#FFA0A0] px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                {address.slice(0, 4)}…{address.slice(-4)} ✕
              </button>
            ) : (
              <button onClick={connect} className="bg-[#2B1B54] hover:bg-[#3B2574] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all">
                {error ? "Retry" : "Connect"}
              </button>
            )}
            <AnimatePresence>
              {showAccounts && !address && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-14 w-72 bg-[#1A1A1A] border border-white/10 rounded-xl p-2 shadow-2xl">
                  <div className="text-xs text-zinc-500 font-bold px-2 py-2 uppercase tracking-wider mb-1">Select Identity</div>
                  {accounts.map((a) => (
                    <button key={a.address} onClick={() => selectAccount(a.address)}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/10 rounded-lg flex justify-between items-center transition-colors">
                      <span className="font-medium text-sm text-white">{a.name || "Wallet"}</span>
                      <span className="font-mono text-xs text-zinc-500">{a.address.slice(0, 6)}…{a.address.slice(-4)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <main className="max-w-[1280px] mx-auto px-6 w-full pt-8 flex flex-col items-center flex-1">
        {/* HERO BANNER */}
        <div className="w-full relative h-[360px] md:h-[420px] rounded-[32px] overflow-hidden bg-gradient-to-b from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center border border-white/5">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B82F6] blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F97316] blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#A855F7] blur-[100px] rounded-full mix-blend-screen opacity-30" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black mb-5 border border-white/10">
              {isUnlocked ? <Unlock className="h-6 w-6 text-[#A0FFA0]" /> : <Lock className="h-6 w-6 text-white" />}
            </div>
            <span className="text-[#F5A572] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              {isUnlocked ? "Unlocked" : "Encrypted Content"}
            </span>
            <h1 className="font-serif text-6xl md:text-[90px] font-normal tracking-tight text-white mb-5 leading-none">
              ZeroGate
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-lg font-medium leading-relaxed">
              Pay once. Own forever. No accounts. No tracking. <br className="hidden md:block" />
              Content access powered by Polkadot.
            </p>
          </div>
        </div>

        {/* CTA + GRID SECTION */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-5xl pb-32">
          {/* LEFT: Clean CTA */}
          <div className="flex flex-col justify-center">
            <span className="text-zinc-500 text-[11px] font-bold tracking-[0.15em] uppercase mb-4">
              {isUnlocked ? "Your Content" : "Get Access"}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl tracking-normal text-white mb-6">
              {isUnlocked ? "Content Unlocked" : "Unlock Premium Content"}
            </h2>
            <p className="text-[#A1A1AA] text-[17px] leading-relaxed mb-10 pr-4">
              {isUnlocked
                ? "Your decryption key is stored locally. This content is yours forever — no subscription, no tracking, no middleman."
                : "One click. One micro-payment. Direct to creator. No email, no password, no data harvesting. Just connect your Polkadot wallet and unlock."}
            </p>

            {error && (
              <p className="text-[#FFA0A0] font-mono text-xs mb-4 p-3 bg-[#2A1111] rounded-lg border border-[#3A1818]">{error}</p>
            )}

            {!isUnlocked ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className="group w-full bg-white text-black text-[17px] font-bold py-5 rounded-2xl hover:bg-zinc-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                >
                  {status === "decrypting" ? (
                    <><div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Settling on Paseo…</>
                  ) : address ? (
                    <><Unlock className="h-5 w-5 group-hover:scale-110 transition-transform" /> Unlock Content — 0.1 PAS</>
                  ) : (
                    <><Lock className="h-5 w-5" /> Connect Polkadot Wallet</>
                  )}
                </button>

                <Link href="/how-it-works"
                  className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors font-medium py-3">
                  How does this work? <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full bg-[#0A1A0A] border border-[#1B2A18] rounded-xl p-5 flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-[#A0FFA0] shrink-0" />
                <div>
                  <h3 className="font-bold text-[#A0FFA0] text-sm">Owned Forever</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Stored locally in your browser. Refresh to verify.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT: 9-PIECE PUZZLE IMAGE */}
          <div className="grid grid-cols-3 gap-[3px] md:gap-1 w-full aspect-square rounded-[20px] overflow-hidden">
            {PUZZLE_PIECES.map((piece, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={isUnlocked
                  ? { rotate: 0, x: 0, y: 0, scale: 1, filter: "brightness(1) grayscale(0)" }
                  : { rotate: piece.scrambleRotate, x: piece.scrambleX, y: piece.scrambleY, scale: 0.88, filter: "brightness(0.3) grayscale(0.9)" }
                }
                transition={{
                  duration: 1.2,
                  delay: isUnlocked ? i * 0.12 : 0,
                  type: "spring",
                  stiffness: 50,
                  damping: 14,
                }}
                className="relative w-full aspect-square overflow-hidden cursor-pointer"
              >
                <div
                  className="absolute inset-0 w-full h-full bg-no-repeat"
                  style={{
                    backgroundImage: "url(/puzzle.png)",
                    backgroundSize: "300% 300%",
                    backgroundPosition: `${piece.col * 50}% ${piece.row * 50}%`,
                  }}
                />
                {/* Lock overlay when not unlocked */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Lock className="h-5 w-5 md:h-6 md:w-6 text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── LOCKED ARTICLE DEMO ─── */}
        <div className="mt-24 w-full max-w-3xl pb-32">
          <span className="text-zinc-500 text-[11px] font-bold tracking-[0.15em] uppercase mb-4 block">
            {isUnlocked ? "Unlocked Article" : "Locked Article Preview"}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
            The Creator Economy is Broken
          </h2>
          <p className="text-zinc-600 text-sm italic mb-8">A thesis on permissionless content monetization</p>

          <div className="relative">
            <div className={`space-y-5 text-[16px] leading-relaxed transition-all duration-700 ${isUnlocked ? "text-zinc-300" : "text-zinc-500 select-none"}`}>
              <p>The internet promised creators direct access to their audience. Instead, it delivered a surveillance economy that extracts 30% fees, forces subscription fatigue, and harvests behavioral data at industrial scale.</p>
              <p style={!isUnlocked ? { filter: "blur(3px)", opacity: 0.7 } : {}}>
                Every &quot;Sign in with Google&quot; button is a Faustian bargain — you trade your identity, your reading habits, and your social graph for the privilege of reading one article. The platform wins. The creator gets pennies. You get tracked.
              </p>
              <p style={!isUnlocked ? { filter: "blur(5px)", opacity: 0.45 } : {}}>
                What if content access was as simple as tapping your wallet? No email. No password. No cookie consent banner. Just a direct value transfer from reader to creator, settled on-chain in under 6 seconds.
              </p>
              <p style={!isUnlocked ? { filter: "blur(8px)", opacity: 0.25 } : {}}>
                ZeroGate proves this is possible today. Using Polkadot&apos;s Smoldot light client running entirely in the browser, we verify transactions without centralized RPC providers. The decryption key never touches a server. Your data stays yours.
              </p>
              <p style={!isUnlocked ? { filter: "blur(10px)", opacity: 0.1 } : {}}>
                This is not a prototype. This is the future of the open web — and it runs on Polkadot.
              </p>
            </div>

            {/* Gradient overlay when locked */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
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

      {/* ─── TOASTS ─── */}
      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-3 rounded-lg border px-5 py-3 shadow-2xl backdrop-blur-sm ${t.type === "error" ? "border-[#3A1818] bg-[#1A0A0A]/95 text-[#FFA0A0]"
                : t.type === "success" ? "border-[#1B2A18] bg-[#0A1A0A]/95 text-[#A0FFA0]"
                  : "border-white/10 bg-[#1A1A1A]/95 text-white"
                }`}>
              {t.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {(!t.type || t.type === "info") && <Info className="h-4 w-4 text-[#F3B4FE] shrink-0" />}
              <span className="font-sans text-sm font-semibold tracking-wide">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
