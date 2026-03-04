# LUMIQ

> Speak a concept. Watch it become an experience.

Voice → Gemini Flash Lite → Single interactive HTML, rendered live.

## Start in 60 seconds

```bash
npm install
# Add GEMINI_API_KEY to .env.local
npm run dev
```

## Stack
- **Next.js 15** App Router
- **Gemini 2.0 Flash Lite** via `@google/generative-ai`
- **MediaRecorder API** for voice capture
- **SSE streaming** → progressive iframe rendering
- **localStorage** for concept history

## Key files
- `lib/system-prompt.ts` — The soul of LUMIQ. Update this to improve outputs.
- `app/api/generate/route.ts` — Gemini SSE streaming API
- `components/VoiceCapture.tsx` — Mic + audio visualizer
- `components/ConceptRenderer.tsx` — Streaming iframe
