import { NextRequest, NextResponse } from "next/server";

// GoPlus uses numeric chain IDs. This maps human-readable names to those IDs.
const CHAIN_IDS: Record<string, string> = {
  ethereum: "1",
  eth: "1",
  bsc: "56",
  binance: "56",
  bnb: "56",
  polygon: "137",
  matic: "137",
  arbitrum: "42161",
  optimism: "10",
  avalanche: "43114",
  avax: "43114",
  base: "8453",
  fantom: "250",
  ftm: "250",
  cronos: "25",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractAddress, chain = "ethereum" } = body as {
      contractAddress: string;
      chain?: string;
    };

    if (!contractAddress || typeof contractAddress !== "string") {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      );
    }

    const sanitizedAddress = contractAddress.trim().toLowerCase();
    const chainId = CHAIN_IDS[chain.toLowerCase()] ?? "1";

    const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${sanitizedAddress}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`GoPlus API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      code: number;
      message: string;
      result: Record<string, unknown>;
    };

    if (data.code !== 1) {
      throw new Error(`GoPlus API returned error: ${data.message}`);
    }

    const tokenData = data.result[sanitizedAddress];

    if (!tokenData) {
      return NextResponse.json(
        { error: "Token not found on this chain. Try a different chain." },
        { status: 404 }
      );
    }

    return NextResponse.json({ auditData: tokenData });
  } catch (error) {
    console.error("Error in audit route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch token data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}