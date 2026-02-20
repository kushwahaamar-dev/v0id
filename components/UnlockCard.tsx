"use client";

/**
 * ZeroGate - Unlock Card
 * Premium Aesthetic: Glassmorphism, 1px gradient borders, btn-glow
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletConnect } from "./WalletConnect";
import { unlockContent } from "@/lib/papi";
import { Loader2, Fingerprint, Lock, ShieldCheck, ArrowRight } from "lucide-react";

const UNLOCK_PRICE = "0.10";

const springTransition = { type: "spring" as const, stiffness: 400, damping: 30 };

export function UnlockCard({
  onUnlocked,
  onToast,
}: {
  onUnlocked: (key: string) => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [status, setStatus] = useState<"connect" | "unlock" | "decrypting">("connect");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const {
    address,
    signer,
    accounts,
    showAccounts,
    error,
    connect,
    selectAccount,
    disconnect,
    setShowAccounts,
  } = WalletConnect();

  useEffect(() => {
    if (address && signer && status === "connect") setStatus("unlock");
  }, [address, signer, status]);

  const handleUnlock = useCallback(async () => {
    if (!address || !signer) return;
    setIsUnlocking(true);
    setStatus("decrypting");
    onToast("Transaction in progress...", "info");
    try {
      const txHash = await unlockContent(address, signer);
      onToast("Transaction finalized on Paseo Asset Hub", "success");
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Verification failed");

      onToast("Verified decryption key. Unlocking...", "success");
      onUnlocked(data.decryptionKey);
    } catch (err: any) {
      onToast(err instanceof Error ? err.message : String(err), "error");
      setStatus("unlock");
    } finally {
      setIsUnlocking(false);
    }
  }, [address, signer, onUnlocked, onToast]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm p-8 moonbird-card shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1"
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2A2624] border border-[#3A3532] shadow-sm">
            <Lock className="h-5 w-5 text-[#FDFDF6]" />
          </div>
          <div>
            <h3 className="font-serif text-2xl tracking-wide text-[#FDFDF6]">
              ZeroGate
            </h3>
            <p className="font-sans text-[10px] text-[#A19D94] font-bold tracking-[0.15em] uppercase mt-0.5">
              Encrypted Content
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "connect" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springTransition}
              className="flex flex-col gap-5"
            >
              {showAccounts && accounts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-[#A19D94] font-medium">Select identity</p>
                  <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                    {accounts.map((a) => (
                      <button
                        key={a.address}
                        onClick={() => selectAccount(a.address)}
                        className="w-full flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#211F1E] px-4 py-3 text-left font-mono text-xs text-[#D6D3CD] transition-colors hover:bg-[#2A2624] hover:text-[#FDFDF6]"
                      >
                        <span className="font-sans font-medium">{a.name ?? "Wallet"}</span>
                        <span className="opacity-60">{a.address.slice(0, 4)}...{a.address.slice(-4)}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAccounts(false)}
                    className="mt-2 text-xs font-semibold tracking-wide text-[#A19D94] hover:text-[#FDFDF6] transition-colors uppercase"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[15px] text-[#A19D94] font-medium leading-relaxed">
                    Connect your Polkadot wallet to verify your identity and unlock this content.
                  </p>
                  <button
                    onClick={connect}
                    disabled={!!error}
                    className="moonbird-button mt-4 flex w-full items-center justify-center gap-2 py-4 text-[15px] transition-all disabled:opacity-50"
                  >
                    <Fingerprint className="h-5 w-5" />
                    {error ? "Retry Connection" : "Connect Identity"}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {status === "unlock" && address && (
            <motion.div
              key="unlock"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springTransition}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#211F1E] p-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-[#A19D94] uppercase">Connected</span>
                  <span className="font-mono text-sm font-medium text-[#F3B4FE]">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => { disconnect(); setStatus("connect"); }}
                  className="text-xs font-semibold tracking-wide text-[#A19D94] hover:text-[#FDFDF6] transition-colors uppercase"
                >
                  Change
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#A19D94] uppercase">Cost</span>
                <span className="font-serif text-3xl font-normal text-[#FDFDF6] tracking-tight">
                  {UNLOCK_PRICE} <span className="font-sans text-lg text-[#A19D94] font-medium ml-1">Test-PAS</span>
                </span>
              </div>

              <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="moonbird-button mt-2 flex w-full items-center justify-center gap-2 py-4 text-[15px] transition-all disabled:opacity-50"
              >
                <span>Unlock Content</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </motion.div>
          )}

          {status === "decrypting" && (
            <motion.div
              key="decrypting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
              className="flex flex-col items-center justify-center gap-6 py-8"
            >
              <div className="relative flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#A19D94] animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="h-6 w-6 text-[#A0FFA0] mb-2" />
                <p className="font-serif text-xl tracking-wide text-[#FDFDF6]">Settling on Paseo</p>
                <p className="font-sans text-sm text-[#A19D94] font-medium">Authenticating nodes...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs font-mono text-[#FFA0A0] text-center mt-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
