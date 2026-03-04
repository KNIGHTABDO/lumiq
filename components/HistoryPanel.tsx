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

  useEffect(() => { setHistory(loadHistory()); }, [isOpen]);

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
      <button className={`history-toggle ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(v => !v)} aria-label="History">
        <ClockIcon />
        {history.length > 0 && <span className="history-count">{history.length}</span>}
      </button>
      <div className={`history-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header"><h3>History</h3><button className="drawer-close" onClick={() => setIsOpen(false)}><CloseIcon /></button></div>
        <div className="drawer-content">
          {history.length === 0 ? <p className="empty-state">Your concept history will appear here</p> : (
            <ul className="history-list">
              {history.map(entry => (
                <li key={entry.id} className={`history-item ${currentId === entry.id ? "active" : ""}`} onClick={() => { onSelect(entry); setIsOpen(false); }}>
                  <div className="item-content"><span className="item-label">{entry.label}</span><span className="item-time">{formatTime(entry.timestamp)}</span></div>
                  <button className="item-delete" onClick={e => deleteEntry(entry.id, e)} aria-label="Delete"><TrashIcon /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {isOpen && <div className="drawer-backdrop" onClick={() => setIsOpen(false)} />}
      <style jsx>{`
        .history-toggle { position: relative; width: 40px; height: 40px; border-radius: 8px; border: 1px solid #1a1a1a; background: transparent; color: #525252; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s, color 0.15s, background 0.15s; }
        .history-toggle:hover, .history-toggle.active { border-color: #333; color: #a3a3a3; background: #0d0d0d; }
        .history-count { position: absolute; top: -4px; right: -4px; background: #262626; color: #a3a3a3; font-size: 0.6rem; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .history-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 320px; max-width: 90vw; background: #0d0d0d; border-left: 1px solid #1a1a1a; z-index: 100; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
        .history-drawer.open { transform: translateX(0); }
        .drawer-backdrop { position: fixed; inset: 0; z-index: 99; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); }
        .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 16px; border-bottom: 1px solid #1a1a1a; }
        .drawer-header h3 { font-size: 0.875rem; font-weight: 500; color: #a3a3a3; letter-spacing: 0.05em; text-transform: uppercase; }
        .drawer-close { background: none; border: none; color: #525252; cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color 0.15s; }
        .drawer-close:hover { color: #a3a3a3; }
        .drawer-content { flex: 1; overflow-y: auto; padding: 8px; }
        .empty-state { padding: 40px 16px; text-align: center; color: #404040; font-size: 0.875rem; }
        .history-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .history-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: background 0.15s; border: 1px solid transparent; }
        .history-item:hover { background: #141414; border-color: #1a1a1a; }
        .history-item.active { background: #141414; border-color: #262626; }
        .item-content { flex: 1; min-width: 0; }
        .item-label { display: block; font-size: 0.8rem; color: #d4d4d4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .item-time { font-size: 0.7rem; color: #404040; }
        .item-delete { background: none; border: none; color: #333; cursor: pointer; padding: 4px; border-radius: 4px; opacity: 0; transition: opacity 0.15s, color 0.15s; flex-shrink: 0; display: flex; align-items: center; }
        .history-item:hover .item-delete { opacity: 1; }
        .item-delete:hover { color: #ef4444; }
      `}</style>
    </>
  );
}

function ClockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>; }
function CloseIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function TrashIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>; }
