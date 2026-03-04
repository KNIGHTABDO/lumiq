"use client";

import { useEffect, useState } from "react";

export interface HistoryEntry { id: string; label: string; html: string; timestamp: number; }

const STORAGE_KEY = "lumiq_history";

export function saveToHistory(label: string, html: string): HistoryEntry {
  const entry: HistoryEntry = { id: crypto.randomUUID(), label: label.slice(0, 80), html, timestamp: Date.now() };
  try {
    const existing = loadHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, 50)));
  } catch {}
  return entry;
}

export function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function HistoryPanel({ onSelect, currentId }: { onSelect: (e: HistoryEntry) => void; currentId?: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);
  useEffect(() => { if (isOpen) setHistory(loadHistory()); }, [isOpen]);

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const formatTime = (ts: number) => {
    const diffH = (Date.now() - ts) / 3600000;
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    return new Date(ts).toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Toggle button — lives in header, always above everything */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="Toggle history"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          height: "34px",
          padding: "0 12px",
          borderRadius: "8px",
          border: `1px solid ${isOpen ? "#333" : "#1a1a1a"}`,
          background: isOpen ? "#141414" : "#0d0d0d",
          color: isOpen ? "#a3a3a3" : "#525252",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "0.78rem",
          fontWeight: 500,
          letterSpacing: "0.03em",
          transition: "all 0.15s",
          position: "relative",
          zIndex: 200,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
        <span>History</span>
        {history.length > 0 && (
          <span style={{
            background: "#262626",
            color: "#a3a3a3",
            fontSize: "0.65rem",
            minWidth: "18px",
            height: "18px",
            padding: "0 4px",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
          }}>{history.length}</span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Drawer — completely detached from header DOM, fixed positioned */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "320px",
          maxWidth: "88vw",
          background: "#0d0d0d",
          borderLeft: "1px solid #1a1a1a",
          zIndex: 160,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#a3a3a3", letterSpacing: "0.08em", textTransform: "uppercase" }}>History</span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close history"
            style={{
              background: "none",
              border: "none",
              color: "#525252",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
              transition: "color 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {history.length === 0 ? (
            <div style={{ padding: "48px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
              </svg>
              <p style={{ fontSize: "0.85rem", color: "#404040", lineHeight: 1.5, maxWidth: "200px" }}>Concepts you explore will appear here</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
              {history.map(entry => (
                <li
                  key={entry.id}
                  onClick={() => { onSelect(entry); setIsOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: `1px solid ${currentId === entry.id ? "#262626" : "transparent"}`,
                    background: currentId === entry.id ? "#141414" : "transparent",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLLIElement).style.background = "#141414"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLLIElement).style.background = currentId === entry.id ? "#141414" : "transparent"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", color: "#d4d4d4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>{entry.label}</div>
                    <div style={{ fontSize: "0.7rem", color: "#404040" }}>{formatTime(entry.timestamp)}</div>
                  </div>
                  <button
                    onClick={e => deleteEntry(entry.id, e)}
                    aria-label="Delete"
                    style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", borderRadius: "4px", flexShrink: 0, transition: "color 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#333"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
