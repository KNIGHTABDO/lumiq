"use client";

import { useState, useCallback, useRef } from "react";
import VoiceCapture from "@/components/VoiceCapture";
import ConceptRenderer from "@/components/ConceptRenderer";
import HistoryPanel, { saveToHistory, HistoryEntry } from "@/components/HistoryPanel";

export default function AppPage() {
  const [streamingHtml, setStreamingHtml] = useState("");
  const [finalHtml, setFinalHtml] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const [currentHistoryId, setCurrentHistoryId] = useState<string>();
  const [voiceState, setVoiceState] = useState<"idle" | "recording" | "processing">("idle");
  const lastLabelRef = useRef("");

  const handleStreaming = useCallback((partial: string) => {
    if (!isStreaming) setIsStreaming(true);
    setStreamingHtml(partial);
    const titleMatch = partial.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const extracted = titleMatch[1].replace(" — LUMIQ", "").trim();
      if (extracted && extracted !== lastLabelRef.current) { lastLabelRef.current = extracted; setCurrentLabel(extracted); }
    }
  }, [isStreaming]);

  const handleResult = useCallback((html: string) => {
    setIsStreaming(false); setFinalHtml(html); setStreamingHtml("");
    const label = lastLabelRef.current || "Concept";
    const entry = saveToHistory(label, html);
    setCurrentHistoryId(entry.id);
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setIsStreaming(false); setFinalHtml(entry.html); setStreamingHtml("");
    setCurrentLabel(entry.label); setCurrentHistoryId(entry.id); lastLabelRef.current = entry.label;
  }, []);

  const displayHtml = streamingHtml || finalHtml;
  const hasContent = displayHtml.length > 0;

  return (
    <div className="app-layout">
      <header className="app-header">
        <a href="/" className="app-logo"><span className="logo-text">LUMIQ</span></a>
        <div className="header-right">
          {currentLabel && <span className="current-label">{currentLabel}</span>}
          <HistoryPanel onSelect={handleHistorySelect} currentId={currentHistoryId} />
        </div>
      </header>
      <main className="app-main">
        <div className={`input-panel ${hasContent ? "compact" : "centered"}`}>
          <div className="input-inner">
            {!hasContent && (
              <div className="empty-hint">
                <div className="hint-grid">
                  {["black holes","RSA encryption","compound interest","DNA replication","fourier transform","binary search","supply & demand","action potential"].map(c => (
                    <span key={c} className="hint-chip">{c}</span>
                  ))}
                </div>
              </div>
            )}
            <VoiceCapture onResult={handleResult} onStreaming={handleStreaming} onStateChange={setVoiceState} disabled={isStreaming} />
            {voiceState === "processing" && (
              <div className="token-indicator">
                <div className="token-bar"><div className="token-fill" /></div>
                <span>Generating with Gemini Flash Lite</span>
              </div>
            )}
          </div>
        </div>
        {hasContent && <div className="renderer-panel"><ConceptRenderer html={displayHtml} isStreaming={isStreaming} /></div>}
      </main>
      <style jsx>{`
        .app-layout { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
        .app-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #0f0f0f; position: sticky; top: 0; z-index: 50; background: rgba(10,10,10,0.9); backdrop-filter: blur(12px); }
        .app-logo { text-decoration: none; }
        .logo-text { font-size: 1rem; font-weight: 700; letter-spacing: 0.15em; color: #f5f5f5; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .current-label { font-size: 0.8rem; color: #525252; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .app-main { flex: 1; display: grid; grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .app-main:has(.renderer-panel) { grid-template-columns: 360px 1fr; } }
        .input-panel { display: flex; align-items: center; justify-content: center; padding: 32px 24px; border-right: 1px solid #0f0f0f; min-height: calc(100vh - 61px); }
        .input-panel.compact { min-height: unset; align-items: flex-start; padding-top: 48px; }
        @media (max-width: 1023px) { .input-panel { min-height: auto; border-right: none; border-bottom: 1px solid #0f0f0f; padding: 24px; } }
        .input-inner { width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; }
        .empty-hint { margin-bottom: 8px; width: 100%; }
        .hint-grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 16px; }
        .hint-chip { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 100px; color: #525252; font-size: 0.75rem; padding: 5px 12px; letter-spacing: 0.02em; }
        .token-indicator { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 8px; }
        .token-bar { width: 160px; height: 2px; background: #1a1a1a; border-radius: 1px; overflow: hidden; }
        .token-fill { height: 100%; background: linear-gradient(90deg, #333, #666); animation: fill-progress 4s ease-out forwards; }
        @keyframes fill-progress { 0% { width: 0%; } 30% { width: 40%; } 70% { width: 75%; } 95% { width: 92%; } 100% { width: 99%; } }
        .token-indicator span { font-size: 0.7rem; color: #333; letter-spacing: 0.04em; }
        .renderer-panel { padding: 32px 24px; overflow-y: auto; }
        @media (max-width: 767px) { .renderer-panel { padding: 20px 16px; } }
      `}</style>
    </div>
  );
}
