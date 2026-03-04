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

interface Props {
  onSelect: (e: HistoryEntry) => void;
  currentId?: string;
  /** If true, only renders the toggle button (used when button lives in header) */
  buttonOnly?: boolean;
  /** External control */
  isOpen?: boolean;
  onToggle?: () => void;
}

export function HistoryButton({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open history"
      style={{
        height: 36,
        padding: "0 14px",
        borderRadius: 8,
        border: "1px solid #1a1a1a",
        background: "#0d0d0d",
        color: "#a3a3a3",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontFamily: "inherit",
        fontSize: "0.8rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#333"; (e.currentTarget as HTMLElement).style.background = "#141414"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a"; (e.currentTarget as HTMLElement).style.background = "#0d0d0d"; }}
    >
      <ClockIcon />
      <span>History</span>
      {count > 0 && (
        <span style={{
          background: "#1f1f1f",
          border: "1px solid #2a2a2a",
          color: "#737373",
          fontSize: "0.65rem",
          minWidth: 18,
          height: 18,
          padding: "0 5px",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}>{count}</span>
      )}
    </button>
  );
}

export default function HistoryPanel({ onSelect, currentId, isOpen = false, onToggle }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 998,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 300,
          maxWidth: "85vw",
          background: "#0d0d0d",
          borderLeft: "1px solid #1a1a1a",
          zIndex: 999,
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
          padding: "18px 20px",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#525252", letterSpacing: "0.1em", textTransform: "uppercase" }}>History</span>
          <button
            onClick={onToggle}
            aria-label="Close history"
            style={{ background: "none", border: "none", color: "#525252", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {history.length === 0 ? (
            <div style={{ padding: "48px 16px", textAlign: "center", color: "#333", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <ClockIcon />
              <p style={{ fontSize: "0.82rem", color: "#404040", lineHeight: 1.5, maxWidth: 200 }}>Your generated concepts will appear here</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2, margin: 0, padding: 0 }}>
              {history.map(entry => (
                <li
                  key={entry.id}
                  onClick={() => { onSelect(entry); onToggle?.(); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: `1px solid ${currentId === entry.id ? "#262626" : "transparent"}`,
                    background: currentId === entry.id ? "#141414" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (currentId !== entry.id) (e.currentTarget as HTMLElement).style.background = "#111"; }}
                  onMouseLeave={e => { if (currentId !== entry.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", color: "#d4d4d4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
                      {entry.label}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#404040" }}>{formatTime(entry.timestamp)}</div>
                  </div>
                  <button
                    onClick={e => deleteEntry(entry.id, e)}
                    aria-label="Delete"
                    style={{ background: "none", border: "none", color: "#2a2a2a", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center", flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#2a2a2a"; }}
                  >
                    <TrashIcon />
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

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
