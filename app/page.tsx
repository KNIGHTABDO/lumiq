import Link from "next/link";

export default function LandingPage() {
  const TOPICS = ["Black Holes","RSA Encryption","DNA Replication","Fourier Transform","Supply & Demand","Binary Search","Action Potential","Quantum Entanglement","Compound Interest","TCP Handshake","Natural Selection","Bayes Theorem","Plate Tectonics","Photosynthesis","Hash Tables","General Relativity"];
  const STEPS = [
    { icon: "🎙", title: "Speak your concept", desc: "Say anything — a question, a topic, a phenomenon. LUMIQ listens through your browser's microphone." },
    { icon: "⚡", title: "Gemini generates", desc: "Gemini 3.1 Flash Lite processes your audio natively and streams a custom interactive HTML experience at blazing speed." },
    { icon: "✶", title: "Interact and understand", desc: "A fully interactive visualization appears. Drag. Adjust. Explore. No reading required." },
  ];
  const DOMAINS = [
    { icon: "⛛", name: "Physics", ex: "how does a pendulum work", out: "Canvas simulation" },
    { icon: "Σ", name: "Mathematics", ex: "explain fourier transform", out: "Interactive proof" },
    { icon: "💻", name: "Computer Science", ex: "binary search algorithm", out: "Step-through viz" },
    { icon: "🧬", name: "Biology", ex: "how does DNA replicate", out: "Animated diagram" },
    { icon: "⚗", name: "Chemistry", ex: "covalent bonding", out: "Molecular explorer" },
    { icon: "📈", name: "Economics", ex: "supply and demand curve", out: "Live chart" },
    { icon: "🔭", name: "Astronomy", ex: "how do black holes form", out: "Space simulation" },
    { icon: "🎵", name: "Music", ex: "how sound waves work", out: "Audio visualizer" },
    { icon: "🏛", name: "History", ex: "fall of the Roman Empire", out: "Interactive timeline" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", overflowX: "hidden" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid #0f0f0f" }}>
        <span style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.15em" }}>LUMIQ</span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#how" style={{ fontSize: "0.8rem", color: "#525252", textDecoration: "none" }}>How it works</a>
          <a href="#examples" style={{ fontSize: "0.8rem", color: "#525252", textDecoration: "none" }}>Examples</a>
          <Link href="/app" style={{ fontSize: "0.8rem", color: "#0a0a0a", background: "#f5f5f5", textDecoration: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 500 }}>Try now →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", paddingTop: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 32px 80px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #1a1a1a", borderRadius: 100, padding: "6px 14px", fontSize: "0.72rem", color: "#525252", background: "#0d0d0d", marginBottom: 40, letterSpacing: "0.04em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b3b3b", display: "inline-block" }} />
            Powered by Gemini 3.1 Flash Lite
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 28 }}>
            <span style={{ display: "block" }}>Speak a concept.</span>
            <span style={{ display: "block", color: "#333" }}>Watch it become</span>
            <span style={{ display: "block" }}>an experience.</span>
          </h1>
          <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.15rem)", color: "#525252", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 48px" }}>LUMIQ turns any idea into a fully interactive visualization in under 3 seconds. No reading. Just understanding.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Link href="/app" style={{ background: "#f5f5f5", color: "#0a0a0a", textDecoration: "none", padding: "14px 28px", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem" }}>Start learning →</Link>
            <a href="#how" style={{ color: "#525252", textDecoration: "none", fontSize: "0.9rem", borderBottom: "1px solid #1a1a1a", paddingBottom: 1 }}>See how it works</a>
          </div>
          <div style={{ display: "flex", gap: 40, alignItems: "center", justifyContent: "center" }}>
            {[{n:"∞",l:"Topics"},{n:"<3s",l:"Generation"},{n:"100%",l:"Voice-first"}].map((s,i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#d4d4d4", letterSpacing: "-0.02em" }}>{s.n}</span>
                <span style={{ fontSize: "0.7rem", color: "#404040", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ borderTop: "1px solid #0f0f0f", borderBottom: "1px solid #0f0f0f", overflow: "hidden", padding: "14px 0", background: "#080808" }}>
        <div style={{ display: "flex", gap: 48, width: "max-content", animation: "marquee 30s linear infinite" }}>
          {[...TOPICS,...TOPICS].map((t,i) => <span key={i} style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2a2a2a", whiteSpace: "nowrap" }}>{t}</span>)}
        </div>
      </div>

      {/* How it works */}
      <section id="how" style={{ padding: "128px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#404040", marginBottom: 16 }}>Process</div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 64 }}>Three seconds from voice to insight</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "#0f0f0f", border: "1px solid #0f0f0f", borderRadius: 12, overflow: "hidden" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ padding: "40px 32px", background: "#080808", position: "relative" }}>
                <div style={{ fontSize: "0.65rem", color: "#262626", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 24 }}>{String(i+1).padStart(2,"0")}</div>
                <div style={{ fontSize: "1.8rem", marginBottom: 16, filter: "grayscale(1) brightness(0.4)" }}>{s.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#d4d4d4", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#404040", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section id="examples" style={{ paddingBottom: 128 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#404040", marginBottom: 16 }}>Capabilities</div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 48 }}>Every domain. Every concept.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: "#0f0f0f", border: "1px solid #0f0f0f", borderRadius: 12, overflow: "hidden" }}>
            {DOMAINS.map((d,i) => (
              <div key={i} style={{ padding: 28, background: "#0a0a0a", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: "1.4rem", filter: "grayscale(1) brightness(0.4)" }}>{d.icon}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#a3a3a3" }}>{d.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#333", fontStyle: "italic" }}>"{d.ex}"</div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.04em", color: "#2a2a2a", textTransform: "uppercase", border: "1px solid #1a1a1a", borderRadius: 4, padding: "3px 8px", display: "inline-block", width: "fit-content" }}>{d.out}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "160px 32px", textAlign: "center", borderTop: "1px solid #0f0f0f", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(255,255,255,0.02) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.1 }}>Understanding has a new shape.</h2>
          <p style={{ color: "#404040", marginBottom: 40, lineHeight: 1.6 }}>Speak anything. See everything. Learn differently.</p>
          <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#f5f5f5", color: "#0a0a0a", textDecoration: "none", padding: "16px 32px", borderRadius: 8, fontSize: "1rem", fontWeight: 600 }}>Open LUMIQ →</Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #0a0a0a", padding: "24px 32px", display: "flex", justifyContent: "space-between", background: "#080808" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", color: "#1a1a1a" }}>LUMIQ</span>
        <span style={{ fontSize: "0.72rem", color: "#1a1a1a" }}>Speak. See. Understand.</span>
      </footer>

      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}
