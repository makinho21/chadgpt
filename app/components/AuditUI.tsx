"use client";

import { useState } from "react";

interface AuditData {
  [key: string]: unknown;
}

interface AnalysisResult {
  analysis: string;
}

const CHAINS = [
  { id: "ethereum", label: "Ethereum" },
  { id: "bsc", label: "BSC" },
  { id: "polygon", label: "Polygon" },
  { id: "arbitrum", label: "Arbitrum" },
  { id: "base", label: "Base" },
  { id: "avalanche", label: "Avalanche" },
];

export default function AuditUI() {
  const [contractAddress, setContractAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "auditing" | "analyzing">("idle");

  async function handleAudit() {
    if (!contractAddress.trim()) {
      setError("Please enter a contract address.");
      return;
    }

    setError(null);
    setAuditData(null);
    setAnalysis(null);
    setLoading(true);
    setStep("auditing");

    try {
      // Step 1: Fetch token security data from GoPlus
      const auditRes = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: contractAddress.trim(), chain }),
      });

      if (!auditRes.ok) {
        const err = await auditRes.json();
        throw new Error(err.error || "Failed to fetch audit data");
      }

      const { auditData: data } = await auditRes.json();
      setAuditData(data);
      setStep("analyzing");

      // Step 2: Send audit data to Claude for analysis
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditData: data,
          contractAddress: contractAddress.trim(),
          chain,
        }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "Failed to analyze token");
      }

      const { analysis: analysisText }: AnalysisResult = await analyzeRes.json();
      setAnalysis(analysisText);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
      setStep("idle");
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem", fontFamily: "monospace" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>🤖 ChadGPT Token Auditor</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        No-nonsense AI-powered crypto token security scanner
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Paste contract address (e.g. 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE)"
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "2px solid #333",
            borderRadius: 4,
            fontFamily: "monospace",
            fontSize: "0.9rem",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAudit()}
        />
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          style={{
            padding: "0.75rem",
            border: "2px solid #333",
            borderRadius: 4,
            fontFamily: "monospace",
            fontSize: "0.9rem",
          }}
        >
          {CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAudit}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: loading ? "#999" : "#000",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          {loading ? (step === "auditing" ? "Scanning…" : "Analyzing…") : "Audit"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #f00",
            borderRadius: 4,
            padding: "1rem",
            color: "#c00",
            marginBottom: "1rem",
          }}
        >
          ❌ {error}
        </div>
      )}

      {analysis && (
        <div
          style={{
            background: "#f0fff0",
            border: "2px solid #0a0",
            borderRadius: 4,
            padding: "1.5rem",
            marginBottom: "1rem",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          <h2 style={{ marginTop: 0 }}>🔥 Chad Hot Takes</h2>
          {analysis}
        </div>
      )}

      {auditData && !analysis && !loading && (
        <details style={{ marginTop: "1rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Raw Audit Data</summary>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: 4,
              overflow: "auto",
              fontSize: "0.8rem",
            }}
          >
            {JSON.stringify(auditData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}