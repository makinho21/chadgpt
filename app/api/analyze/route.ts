import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(
  auditData: unknown,
  contractAddress: string,
  chain: string
): string {
  return `You are ChadGPT, a brutally honest crypto security expert. Analyze the following token security data and give your unfiltered assessment.

Contract Address: ${contractAddress}
Chain: ${chain}

Security Data (from GoPlus Security API):
${JSON.stringify(auditData, null, 2)}

Respond in EXACTLY this format:

TRUST_SCORE: [number 0-100]
VERDICT: [SAFE / RISKY / SCAM]

KEY FINDINGS:
- [Most important finding]
- [Second finding]
- [Third finding]
- [Additional findings as needed]

CHAD TAKE:
[Your honest, direct, plain-English verdict on this token. Be specific about the risks you found. No sugarcoating.]`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditData, contractAddress, chain } = body as {
      auditData: unknown;
      contractAddress: string;
      chain: string;
    };

    if (!auditData) {
      return NextResponse.json({ error: "Audit data is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(auditData, contractAddress ?? "unknown", chain ?? "unknown");

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const analysisText =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ analysis: analysisText });
  } catch (error) {
    console.error("Error in analyze route:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}