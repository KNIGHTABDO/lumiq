"use client";

import { useEffect, useRef, useState } from "react";

interface ConceptRendererProps {
  html: string;
  isStreaming: boolean;
  onExpand?: () => void;
}

export default function ConceptRenderer({ html, isStreaming, onExpand }: ConceptRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(html);
      if (!isStreaming) doc.close();
    } catch {}
  }, [html, isStreaming]);

  useEffect(() => { if (html && !isVisible) requestAnimationFrame(() => setIsVisible(true)); }, [html]);

  if (!html) return null;

  return (
    <>
      <div className={`renderer-container ${isVisible ? "visible" : ""} ${isExpanded ? "hidden" : ""}`}>
        {isStreaming && <div className="stream-indicator"><div className="stream-bar" /><span>Building experience...</span></div>}
        <div className="iframe-wrapper">
          <iframe ref={iframeRef} sandbox="allow-scripts allow-same-origin" title="LUMIQ Concept Experience" className="concept-iframe" />
          {!isStreaming && <div className="iframe-controls"><button className="expand-btn" onClick={() => { setIsExpanded(true); onExpand?.(); }} title="Full screen"><ExpandIcon /></button></div>}
          {isStreaming && <div className="shimmer-overlay" />}
        </div>
      </div>
      {isExpanded && (
        <div className="fullscreen-view">
          <button className="close-fullscreen" onClick={() => setIsExpanded(false)}><CollapseIcon /><span>Exit fullscreen</span></button>
          <iframe sandbox="allow-scripts allow-same-origin" title="LUMIQ Fullscreen" srcDoc={html} className="fullscreen-iframe" />
        </div>
      )}
      <style jsx>{`
        .renderer-container { width: 100%; opacity: 0; transform: translateY(12px) scale(0.99); transition: opacity 0.4s ease-out, transform 0.4s ease-out; }
        .renderer-container.visible { opacity: 1; transform: translateY(0) scale(1); }
        .renderer-container.hidden { display: none; }
        .stream-indicator { display: flex; align-items: center; gap: 10px; padding: 0 0 12px; font-size: 0.75rem; color: #525252; letter-spacing: 0.05em; text-transform: uppercase; }
        .stream-bar { width: 80px; height: 2px; background: #1a1a1a; border-radius: 1px; overflow: hidden; position: relative; }
        .stream-bar::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, #525252, transparent); animation: scan 1.2s ease-in-out infinite; }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .iframe-wrapper { position: relative; width: 100%; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; background: #0d0d0d; }
        .concept-iframe { width: 100%; height: 520px; border: none; display: block; background: #0a0a0a; }
        @media (max-width: 767px) { .concept-iframe { height: 420px; } }
        .iframe-controls { position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; }
        .iframe-wrapper:hover .iframe-controls { opacity: 1; }
        .expand-btn { background: rgba(10,10,10,0.9); border: 1px solid #262626; border-radius: 6px; color: #a3a3a3; padding: 6px 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; transition: border-color 0.15s, color 0.15s; backdrop-filter: blur(8px); }
        .expand-btn:hover { border-color: #404040; color: #f5f5f5; }
        .shimmer-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.01) 50%, transparent 60%); background-size: 200% 200%; animation: shimmer 2s linear infinite; pointer-events: none; }
        @keyframes shimmer { 0% { background-position: 200% 200%; } 100% { background-position: -200% -200%; } }
        .fullscreen-view { position: fixed; inset: 0; z-index: 1000; background: #0a0a0a; display: flex; flex-direction: column; animation: fade-in 0.25s ease-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .close-fullscreen { position: absolute; top: 16px; right: 16px; z-index: 10; background: rgba(10,10,10,0.9); border: 1px solid #262626; border-radius: 6px; color: #a3a3a3; padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.8rem; transition: border-color 0.15s, color 0.15s; backdrop-filter: blur(8px); }
        .close-fullscreen:hover { border-color: #404040; color: #f5f5f5; }
        .fullscreen-iframe { flex: 1; width: 100%; border: none; background: #0a0a0a; }
      `}</style>
    </>
  );
}

function ExpandIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>; }
function CollapseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="10" y1="14" x2="3" y2="21" /><line x1="21" y1="3" x2="14" y2="10" /></svg>; }
