"use client";

/**
 * ZeroGate - Wallet Connection via Polkadot Extension
 * Uses @polkadot/extension-dapp for web3Enable/web3Accounts.
 * Bridges to PAPI signer via getPolkadotSignerFromPjs.
 */

import { useCallback, useState } from "react";
import { getPolkadotSignerFromPjs } from "polkadot-api/pjs-signer";
import { useWalletStore } from "@/lib/store";

const DAPP_NAME = "ZeroGate";

export function WalletConnect() {
  const { address, signer, setAddress, setSigner, setIsConnecting } = useWalletStore();
  const [accounts, setAccounts] = useState<{ address: string; name?: string }[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Prevent double execution
    if (useWalletStore.getState().isConnecting) return;

    setError(null);
    setIsConnecting(true);
    try {
      const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable(DAPP_NAME);
      if (extensions.length === 0) {
        setError("No Polkadot wallet extension found. Install Polkadot.js, Talisman, or SubWallet.");
        setIsConnecting(false);
        return;
      }
      const allAccounts = await web3Accounts();
      const list = allAccounts;
      setAccounts(
        list.map((a) => ({
          address: a.address,
          name: (a.meta as { name?: string })?.name,
        }))
      );
      setShowAccounts(true);
    } catch (err: any) {
      if (err.message?.includes("pending authorization request")) {
        setError("Please open your wallet extension (Polkadot.js/Talisman) to approve the pending connection request.");
      } else {
        setError(err instanceof Error ? err.message : "Connection failed");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [setIsConnecting]);

  const selectAccount = useCallback(
    async (addr: string) => {
      setError(null);
      setIsConnecting(true);
      try {
        const { web3FromAddress } = await import("@polkadot/extension-dapp");
        const injector = await web3FromAddress(addr);
        if (!injector?.signer?.signPayload || !injector?.signer?.signRaw) {
          throw new Error("Extension does not support transaction signing");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const papiSigner = getPolkadotSignerFromPjs(
          addr,
          injector.signer.signPayload.bind(injector.signer) as any,
          injector.signer.signRaw.bind(injector.signer) as any
        );
        setAddress(addr);
        setSigner(papiSigner);
        setShowAccounts(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get signer");
      } finally {
        setIsConnecting(false);
      }
    },
    [setAddress, setSigner, setIsConnecting]
  );

  const disconnect = useCallback(() => {
    useWalletStore.getState().reset();
    setShowAccounts(false);
    setAccounts([]);
    setError(null);
  }, []);

  return {
    address,
    signer,
    accounts,
    showAccounts,
    error,
    connect,
    selectAccount,
    disconnect,
    setShowAccounts,
  };
}
