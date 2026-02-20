/**
 * ZeroGate - Polkadot API Transaction Logic
 * Handles Paseo transfers via light client (with WSS fallback).
 */

import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { dot, getMetadata } from "@polkadot-api/descriptors";
import { MultiAddress } from "@polkadot-api/descriptors";
import type { PolkadotSigner } from "polkadot-api";
import { getPaseoChain } from "./smoldot";

// Creator address to receive payments (Paseo SS58 format)
export const CREATOR_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_ADDRESS ||
  "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

// Unlock price in planck (0.1 Test-PAS = 10^9 planck)
const UNLOCK_AMOUNT = BigInt(10 ** 9);

const WSS_URL = "wss://paseo.dotters.network";

let clientInstance: Awaited<ReturnType<typeof createClient>> | null = null;

/**
 * Get or create the PAPI client connected to Paseo.
 * Uses Smoldot light client, falls back to WSS on timeout or error.
 */
async function getClient() {
  if (clientInstance) return clientInstance;

  try {
    // Attempt Smoldot chain initialization with a 5-second timeout
    const chain = await Promise.race([
      getPaseoChain(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Smoldot initialization timeout")), 3000)
      ),
    ]);
    const provider = getSmProvider(chain);
    clientInstance = createClient(provider, { getMetadata });
    console.log("ZeroGate: Using Smoldot Light Client");
  } catch (err) {
    console.warn("ZeroGate: Smoldot failed or timed out. Falling back to WSS.", err);
    const provider = getWsProvider(WSS_URL);
    clientInstance = createClient(provider, { getMetadata });
    console.log("ZeroGate: Using WSS Fallback Provider");
  }
  return clientInstance;
}

/**
 * Execute the unlock payment: transfer Test-PAS to creator, return txHash when finalized.
 */
export async function unlockContent(
  senderAddress: string,
  signer: PolkadotSigner
): Promise<string> {
  const client = await getClient();
  const typedApi = client.getTypedApi(dot);

  const tx = typedApi.tx.Balances.transfer_keep_alive({
    dest: MultiAddress.Id(CREATOR_ADDRESS),
    value: UNLOCK_AMOUNT,
  });

  return new Promise((resolve, reject) => {
    const sub = tx.signSubmitAndWatch(signer).subscribe({
      next: (ev) => {
        if (ev.type === "finalized") {
          if (!ev.ok) {
            reject(new Error("Transaction failed on-chain"));
            return;
          }
          resolve(ev.txHash);
          sub.unsubscribe();
        }
      },
      error: (err) => {
        // Polkadot API throws an object for pool rejection errors.
        // E.g., { type: "Invalid", value: { type: "Payment" } }
        if (err && typeof err === "object" && "type" in err && err.type === "Invalid") {
          const val = (err as any).value;
          if (val && val.type === "Payment") {
            reject(new Error("Insufficient Test-PAS balance to cover amount + gas fees, or account would drop below Existential Deposit. Please use a Paseo faucet."));
            return;
          }
        }
        reject(err instanceof Error ? err : new Error(JSON.stringify(err)));
      },
    });
  });
}
