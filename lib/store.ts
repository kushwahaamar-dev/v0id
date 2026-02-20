/**
 * ZeroGate - Global Wallet State (Zustand)
 */

import { create } from "zustand";
import type { PolkadotSigner } from "polkadot-api";

export interface WalletState {
  address: string | null;
  signer: PolkadotSigner | null;
  isConnecting: boolean;
  setAddress: (address: string | null) => void;
  setSigner: (signer: PolkadotSigner | null) => void;
  setIsConnecting: (v: boolean) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  signer: null,
  isConnecting: false,
  setAddress: (address) => set({ address }),
  setSigner: (signer) => set({ signer }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  reset: () => set({ address: null, signer: null, isConnecting: false }),
}));
