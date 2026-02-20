/**
 * ZeroGate - Polkadot API Transaction Logic
 * Uses direct WSS connection for speed. Smoldot is too slow for demo.
 */

import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { dot, getMetadata } from "@polkadot-api/descriptors";
import { MultiAddress } from "@polkadot-api/descriptors";
import type { PolkadotSigner } from "polkadot-api";

export const CREATOR_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_ADDRESS ||
  "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

const UNLOCK_AMOUNT = BigInt(10 ** 9); // 0.1 PAS

const WSS_URL = "wss://paseo.dotters.network";

let clientInstance: Awaited<ReturnType<typeof createClient>> | null = null;

/**
 * Get or create the PAPI client. Uses WSS directly for instant connectivity.
 */
function getClient() {
  if (clientInstance) return clientInstance;
  const provider = getWsProvider(WSS_URL);
  clientInstance = createClient(provider, { getMetadata });
  return clientInstance;
}

// Pre-warm connection on module load (browser only)
if (typeof window !== "undefined") {
  getClient();
}

/**
 * Execute the unlock payment: transfer Test-PAS to creator.
 * Resolves on block inclusion (~6s) for speed.
 */
export async function unlockContent(
  senderAddress: string,
  signer: PolkadotSigner
): Promise<string> {
  const client = getClient();
  const typedApi = client.getTypedApi(dot);

  const tx = typedApi.tx.Balances.transfer_keep_alive({
    dest: MultiAddress.Id(CREATOR_ADDRESS),
    value: UNLOCK_AMOUNT,
  });

  return new Promise((resolve, reject) => {
    const sub = tx.signSubmitAndWatch(signer).subscribe({
      next: (ev) => {
        // Resolve as soon as tx is included in a best block (~6s)
        if (ev.type === "txBestBlocksState") {
          if (!ev.found) return;
          resolve(ev.block.hash);
          sub.unsubscribe();
        }
        if (ev.type === "finalized") {
          resolve(ev.txHash);
          sub.unsubscribe();
        }
      },
      error: (err) => {
        if (err && typeof err === "object" && "type" in err && err.type === "Invalid") {
          const val = (err as any).value;
          if (val && val.type === "Payment") {
            reject(new Error("Insufficient Test-PAS balance. Use a Paseo faucet."));
            return;
          }
        }
        reject(err instanceof Error ? err : new Error(JSON.stringify(err)));
      },
    });
  });
}
