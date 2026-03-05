"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type RecordingState = "idle" | "recording" | "processing";

interface VoiceCaptureProps {
  onResult: (html: string) => void;
  onStreaming: (partial: string) => void;
  onStateChange?: (state: RecordingState) => void;
  disabled?: boolean;
  /** Register a function that AppPage can call to submit a text concept directly */
  onRegisterSubmit?: (fn: (text: string) => void) => void;
}

const MAX_RECORDING_SECONDS = 60;

export default function VoiceCapture({ onResult, onStreaming, onStateChange, disabled = false, onRegisterSubmit }: VoiceCaptureProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [error, setError] = useState<string>("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    setRecordingSeconds(0);
    mediaRecorderRef.current?.stop();
  }, []);

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
      setRecordingSeconds(0);

      // Countdown timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

      // Auto-stop at MAX_RECORDING_SECONDS
      autoStopRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_SECONDS * 1000);

    } catch { setError("Microphone access denied. Use text input below."); setShowTextFallback(true); }
  }, [processAudio, trackAudioLevel, updateState, stopRecording]);

  // Register direct text-submit fn for parent (hint chips)
  const submitText = useCallback(async (text: string) => {
    if (!text.trim() || state !== "idle") return;
    updateState("processing"); setError("");
    const formData = new FormData();
    formData.append("text", text.trim());
    try {
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
  }, [state, onResult, onStreaming, updateState]);

  useEffect(() => {
    if (onRegisterSubmit) onRegisterSubmit(submitText);
  }, [onRegisterSubmit, submitText]);

  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    await submitText(textInput.trim());
    setTextInput("");
  }, [textInput, submitText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isIdle = state === "idle";
  const timeLeft = MAX_RECORDING_SECONDS - recordingSeconds;

  return (
    <div className="voice-capture">
      {/* Main mic button */}
      <div className="mic-area">
        <button
          className={`mic-btn ${isRecording ? "recording" : ""} ${isProcessing ? "processing" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing}
          aria-label={isRecording ? "Stop recording" : isProcessing ? "Processing..." : "Start recording"}
        >
          <span className="mic-icon">
            {isRecording ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : isProcessing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6l4 2" strokeLinecap="round" /><circle cx="12" cy="12" r="10" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            )}
          </span>
          {isRecording && (
            <span className="audio-ring" style={{ transform: `scale(${1 + audioLevel * 0.4})`, opacity: 0.15 + audioLevel * 0.35 }} />
          )}
        </button>
        <div className="mic-status">
          {isIdle && !isProcessing && <span className="status-idle">Tap to speak a concept</span>}
          {isRecording && (
            <span className="status-recording">
              Recording
              <span className="status-time" style={{ color: timeLeft <= 10 ? '#ef4444' : undefined }}>
                &nbsp;{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </span>
          )}
          {isProcessing && <span className="status-processing">Processing audio...</span>}
        </div>
      </div>

      {error && (
        <div className="voice-error">{error}</div>
      )}

      {/* Text fallback */}
      {(showTextFallback || true) && (
        <form className="text-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="text-input"
            placeholder="or type a concept..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            disabled={isProcessing || isRecording}
            spellCheck={false}
          />
          <button type="submit" className="text-submit" disabled={!textInput.trim() || isProcessing || isRecording} aria-label="Submit">
            &#8594;
          </button>
        </form>
      )}

      <style jsx>{`
        .voice-capture { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .mic-area { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .mic-btn {
          position: relative;
          width: 72px; height: 72px;
          border-radius: 50%;
          background: #111;
          border: 1.5px solid #1f1f1f;
          color: #525252;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .mic-btn:hover:not(:disabled) { background: #161616; border-color: #2a2a2a; color: #a3a3a3; }
        .mic-btn.recording { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); color: #ef4444; }
        .mic-btn.processing { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.2); color: #3b82f6; animation: pulse-btn 1.5s ease-in-out infinite; }
        .mic-btn:disabled:not(.processing) { opacity: 0.4; cursor: not-allowed; }
        @keyframes pulse-btn { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .audio-ring {
          position: absolute; inset: -8px;
          border-radius: 50%;
          background: rgba(239,68,68,0.18);
          transition: transform 0.1s, opacity 0.1s;
          pointer-events: none;
        }
        .mic-icon { display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
        .mic-status { font-size: 0.78rem; color: #333; text-align: center; min-height: 18px; }
        .status-idle { color: #2d2d2d; }
        .status-recording { color: #ef4444; display: flex; align-items: center; gap: 4px; }
        .status-time { font-variant-numeric: tabular-nums; font-size: 0.75rem; }
        .status-processing { color: #3b82f6; }
        .voice-error { font-size: 0.78rem; color: #ef4444; text-align: center; max-width: 280px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 8px; padding: 8px 12px; line-height: 1.5; }
        .text-form { display: flex; width: 100%; gap: 8px; align-items: center; }
        .text-input {
          flex: 1;
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          color: #f5f5f5;
          font-size: 0.85rem;
          padding: 9px 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .text-input:focus { border-color: #2d2d2d; }
        .text-input::placeholder { color: #333; }
        .text-input:disabled { opacity: 0.4; }
        .text-submit {
          background: #f5f5f5;
          border: none;
          border-radius: 7px;
          color: #0a0a0a;
          font-size: 1rem;
          width: 36px; height: 36px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
          display: flex; align-items: center; justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        .text-submit:hover:not(:disabled) { background: #e5e5e5; }
        .text-submit:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
