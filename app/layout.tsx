import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LUMIQ — Speak a concept. Watch it become an experience.",
  description: "LUMIQ turns any idea into a fully interactive visualization in under 3 seconds. Physics, math, biology, CS — everything. Voice-first. Powered by Gemini 3.1 Flash Lite.",
  openGraph: {
    title: "LUMIQ",
    description: "Speak a concept. Watch it become an experience.",
    siteName: "LUMIQ",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body style={{
        margin: 0,
        padding: 0,
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}>
        {children}
      </body>
    </html>
  );
}
