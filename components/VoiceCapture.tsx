"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type RecordingState = "idle" | "recording" | "processing";

interface VoiceCaptureProps {
  onResult: (html: string) => void;
  onStreaming: (partial: string) => void;
  onStateChange?: (state: RecordingState) => void;
  disabled?: boolean;
}

export default function VoiceCapture({ onResult, onStreaming, onStateChange, disabled = false }: VoiceCaptureProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const updateState = useCallback((s: RecordingState) => { setState(s); onStateChange?.(s); }, [onStateChange]);

  const trackAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(avg / 128);
    animFrameRef.current = requestAnimationFrame(trackAudioLevel);
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    updateState("processing");
    setError("");
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("mimeType", audioBlob.type || "audio/webm");
      const response = await fetch("/api/generate", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Generation failed");
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullHtml = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) { onResult(fullHtml); updateState("idle"); return; }
              if (data.error) throw new Error(data.error);
              if (data.text) { fullHtml += data.text; onStreaming(fullHtml); }
            } catch {}
          }
        }
      }
      onResult(fullHtml); updateState("idle");
    } catch { setError("Generation failed. Try again."); updateState("idle"); }
  }, [onResult, onStreaming, updateState]);

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      trackAudioLevel();
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        processAudio(blob);
      };
      recorder.start();
      updateState("recording");
    } catch { setError("Microphone access denied. Use text input below."); setShowTextFallback(true); }
  }, [processAudio, trackAudioLevel, updateState]);

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); }, []);

  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    updateState("processing"); setError("");
    const formData = new FormData();
    formData.append("text", textInput.trim());
    try {
      const response = await fetch("/api/generate", { method: "POST", body: formData });
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullHtml = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) { onResult(fullHtml); updateState("idle"); setTextInput(""); return; }
              if (data.text) { fullHtml += data.text; onStreaming(fullHtml); }
            } catch {}
          }
        }
      }
      onResult(fullHtml); updateState("idle"); setTextInput("");
    } catch { setError("Generation failed. Try again."); updateState("idle"); }
  }, [textInput, onResult, onStreaming, updateState]);

  useEffect(() => () => { cancelAnimationFrame(animFrameRef.current); streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <div className="voice-capture">
      <div className="mic-container">
        {isRecording && <div className="pulse-rings">{[1,2,3].map(i => <div key={i} className="pulse-ring" style={{ animationDelay: `${i*0.2}s` }} />)}</div>}
        {isRecording && <div className="audio-glow" style={{ opacity: 0.3 + audioLevel * 0.7, transform: `scale(${1 + audioLevel * 0.15})` }} />}
        <button className={`mic-btn ${state}`} onClick={isRecording ? stopRecording : isProcessing ? undefined : startRecording} disabled={disabled || isProcessing} aria-label={isRecording ? "Stop" : isProcessing ? "Processing" : "Record"}>
          {isProcessing ? <ProcessingIcon /> : isRecording ? <StopIcon /> : <MicIcon />}
        </button>
      </div>
      <div className="state-label">
        {isProcessing && <span className="processing-dots">Building your experience</span>}
        {isRecording && <span className="recording-text">Listening... tap to stop</span>}
        {state === "idle" && !error && <span className="idle-text">Tap and speak a concept</span>}
      </div>
      {error && <p className="error-text">{error}</p>}
      <button className="text-toggle" onClick={() => setShowTextFallback(v => !v)} type="button">{showTextFallback ? "Hide text input" : "Type instead"}</button>
      {showTextFallback && (
        <form onSubmit={handleTextSubmit} className="text-form">
          <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="e.g. how does a black hole form" className="text-input" disabled={isProcessing} />
          <button type="submit" className="text-submit" disabled={isProcessing || !textInput.trim()}>→</button>
        </form>
      )}
      <style jsx>{`
        .voice-capture { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px 0; }
        .mic-container { position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; }
        .audio-glow { position: absolute; inset: -8px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); transition: opacity 0.05s, transform 0.05s; pointer-events: none; }
        .pulse-rings { position: absolute; inset: 0; pointer-events: none; }
        .pulse-ring { position: absolute; inset: 0; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; animation: pulse-expand 1.5s ease-out infinite; }
        @keyframes pulse-expand { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        .mic-btn { position: relative; z-index: 1; width: 80px; height: 80px; border-radius: 50%; border: 1px solid #333; background: #141414; color: #f5f5f5; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, border-color 0.2s, transform 0.15s; outline: none; }
        .mic-btn:hover:not(:disabled) { background: #1a1a1a; border-color: #525252; transform: scale(1.05); }
        .mic-btn.recording { background: #1a1a1a; border-color: #f5f5f5; box-shadow: 0 0 0 1px #f5f5f5; }
        .mic-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .state-label { height: 20px; display: flex; align-items: center; }
        .idle-text { font-size: 0.875rem; color: #525252; }
        .recording-text { font-size: 0.875rem; color: #a3a3a3; animation: text-pulse 1s ease-in-out infinite; }
        @keyframes text-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .processing-dots { font-size: 0.875rem; color: #a3a3a3; }
        .processing-dots::after { content: ''; animation: dots 1.5s steps(3,end) infinite; }
        @keyframes dots { 0% { content: ''; } 33% { content: '.'; } 66% { content: '..'; } 100% { content: '...'; } }
        .error-text { font-size: 0.8rem; color: #ef4444; text-align: center; max-width: 280px; }
        .text-toggle { font-size: 0.75rem; color: #525252; background: none; border: none; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
        .text-toggle:hover { color: #a3a3a3; }
        .text-form { display: flex; gap: 8px; width: 100%; max-width: 360px; }
        .text-input { flex: 1; background: #141414; border: 1px solid #262626; border-radius: 6px; padding: 10px 14px; color: #f5f5f5; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
        .text-input:focus { border-color: #525252; }
        .text-input::placeholder { color: #404040; }
        .text-submit { background: #1a1a1a; border: 1px solid #262626; border-radius: 6px; color: #f5f5f5; padding: 10px 16px; cursor: pointer; font-size: 1rem; transition: border-color 0.15s, background 0.15s; }
        .text-submit:hover:not(:disabled) { border-color: #525252; background: #222; }
        .text-submit:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function MicIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0014 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" /></svg>; }
function StopIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>; }
function ProcessingIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" strokeOpacity="0.2" /><path d="M12 3a9 9 0 019 9" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></path></svg>; }
