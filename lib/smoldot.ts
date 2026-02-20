/**
 * ZeroGate - Smoldot WebWorker Light Client
 * Runs the Polkadot light client in a Web Worker to avoid blocking the UI.
 * Connects to Paseo Asset Hub testnet.
 */

import { startFromWorker } from "polkadot-api/smoldot/from-worker";
import { paseo, paseo_asset_hub } from "polkadot-api/chains";
import type { Chain } from "@polkadot-api/smoldot";

let smoldotInstance: Awaited<ReturnType<typeof startFromWorker>> | null = null;
let chainPromise: Promise<Chain> | null = null;

/**
 * Get or create the Smoldot instance with WebWorker.
 * Uses Webpack/Next.js compatible worker instantiation.
 */
function getSmoldot() {
  if (smoldotInstance) return smoldotInstance;
  const smWorker = new Worker(
    new URL("polkadot-api/smoldot/worker", import.meta.url)
  );
  smoldotInstance = startFromWorker(smWorker, {
    maxLogLevel: 2, // 1 = Error, 2 = Warn, 3 = Info, 4 = Debug (Suppresses noisy WSS connection logs)
  });
  return smoldotInstance;
}

/**
 * Get the Paseo Relay Chain.
 * Adds only the relay chain to Smoldot.
 */
export async function getPaseoChain(): Promise<Chain> {
  if (chainPromise) return chainPromise;

  chainPromise = (async () => {
    const smoldot = getSmoldot();

    // Filter out turboflakes bootnodes because they are repeatedly failing
    // on some networks and causing red WS errors in the browser console.
    const paseoSpec = JSON.parse(paseo);
    paseoSpec.bootNodes = paseoSpec.bootNodes.filter(
      (node: string) => !node.includes("turboflakes.io")
    );
    const relayChain = await smoldot.addChain({ chainSpec: JSON.stringify(paseoSpec) });

    return relayChain;
  })();

  return chainPromise;
}

/**
 * Reset the chain (for cleanup or reconnection).
 */
export function resetSmoldot() {
  chainPromise = null;
  if (smoldotInstance) {
    smoldotInstance.terminate();
    smoldotInstance = null;
  }
}
