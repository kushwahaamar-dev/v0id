/**
 * ZeroGate - Payment Verification API
 * Verifies on-chain payment and returns decryption key for content.
 * Stub implementation: simulates Supabase lookup, returns dummy key.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { txHash } = await request.json();

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid txHash" },
        { status: 400 }
      );
    }

    // Verify txHash and return decryption key instantly

    // In production: query Supabase for txHash, verify on-chain, return real key
    const decryptionKey = `zerogate-decrypt-${txHash.slice(0, 16)}`;

    return NextResponse.json({
      success: true,
      decryptionKey,
      txHash,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
