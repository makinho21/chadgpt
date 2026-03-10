import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChadGPT — Token Auditor",
  description: "No-nonsense crypto token security scanner powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}