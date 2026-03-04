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
      <style>{`
        .nav-link-desktop { display: none; }
        @media (min-width: 640px) { .nav-link-desktop { display: inline !important; } }
        @media (max-width: 639px) {
          .hero-section { padding: 96px 20px 60px !important; }
          .hero-title { font-size: clamp(2.1rem, 9vw, 3rem) !important; letter-spacing: -0.025em !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .domains-grid { grid-template-columns: 1fr 1fr !important; }
          .section-inner { padding: 60px 20px !important; }
          .footer-links { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 54, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid #0f0f0f" }}>
        <span style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.15em" }}>LUMIQ</span>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#how" className="nav-link-desktop" style={{ fontSize: "0.8rem", color: "#525252", textDecoration: "none" }}>How it works</a>
          <a href="#examples" className="nav-link-desktop" style={{ fontSize: "0.8rem", color: "#525252", textDecoration: "none" }}>Examples</a>
          <Link href="/app" style={{ fontSize: "0.82rem", color: "#0a0a0a", background: "#f5f5f5", textDecoration: "none", padding: "7px 16px", borderRadius: 6, fontWeight: 600, whiteSpace: "nowrap" }}>Try now →</Link>
        </div>
      </nav>

      <section className="hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #1a1a1a", borderRadius: 100, padding: "6px 14px", fontSize: "0.72rem", color: "#525252", background: "#0d0d0d", marginBottom: 40, letterSpacing: "0.04em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b3b3b", display: "inline-block" }} />
            Powered by Gemini 3.1 Flash Lite
          </div>
          <h1 className="hero-title" style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#f5f5f5", marginBottom: 28 }}>
            Speak a concept.<br />
            <span style={{ color: "#444" }}>Watch it come alive.</span>
          </h1>
          <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.05rem)", color: "#525252", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            LUMIQ turns any idea into a fully interactive visualization in seconds. Physics, math, biology, CS — everything.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/app" style={{ display: "inline-block", background: "#f5f5f5", color: "#0a0a0a", textDecoration: "none", padding: "13px 28px", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem" }}>Try it now →</Link>
            <a href="#how" style={{ display: "inline-block", border: "1px solid #1f1f1f", color: "#525252", textDecoration: "none", padding: "13px 28px", borderRadius: 8, fontWeight: 500, fontSize: "0.95rem" }}>How it works</a>
          </div>
          <div style={{ marginTop: 56, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", opacity: 0.45 }}>
            {TOPICS.slice(0, 8).map(t => (
              <span key={t} style={{ fontSize: "0.72rem", border: "1px solid #1a1a1a", borderRadius: 100, padding: "4px 12px", color: "#444", letterSpacing: "0.02em" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="how">
        <div className="section-inner" style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 48, color: "#f5f5f5" }}>How it works</h2>
          <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: "#0d0d0d", border: "1px solid #141414", borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: "0.68rem", color: "#333", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Step {i + 1}</div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 600, marginBottom: 10, color: "#d4d4d4" }}>{s.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#404040", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="examples" style={{ background: "#050505" }}>
        <div className="section-inner" style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, color: "#f5f5f5" }}>Works across every domain</h2>
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#333", marginBottom: 40 }}>Any concept. Any field. Instant visualization.</p>
          <div className="domains-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {DOMAINS.map((d) => (
              <div key={d.name} style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 10, padding: "16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }}>{d.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#d4d4d4", marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#333", fontStyle: "italic", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>"{d.ex}"</div>
                  <div style={{ fontSize: "0.65rem", color: "#2a2a2a", background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, padding: "2px 6px", display: "inline-block" }}>{d.out}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16, color: "#f5f5f5" }}>Ready to understand anything?</h2>
          <p style={{ fontSize: "0.9rem", color: "#404040", marginBottom: 32 }}>No signup. No install. Just speak.</p>
          <Link href="/app" style={{ display: "inline-block", background: "#f5f5f5", color: "#0a0a0a", textDecoration: "none", padding: "14px 32px", borderRadius: 8, fontWeight: 700, fontSize: "1rem" }}>Open LUMIQ →</Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #0f0f0f", padding: "24px" }}>
        <div className="footer-links" style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em" }}>LUMIQ</span>
          <span style={{ fontSize: "0.72rem", color: "#2a2a2a" }}>Powered by Gemini 3.1 Flash Lite</span>
          <Link href="/app" style={{ fontSize: "0.72rem", color: "#333", textDecoration: "none" }}>Launch app →</Link>
        </div>
      </footer>
    </div>
  );
}
