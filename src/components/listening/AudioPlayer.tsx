"use client";
import { useState, useCallback, useEffect, useRef } from "react";

interface Props {
  text: string;
  mode?: "single" | "dialogue" | "choices";
  choices?: { label: string; text: string }[];
}

interface VoicePair {
  female: SpeechSynthesisVoice | null;
  male: SpeechSynthesisVoice | null;
  fallback: SpeechSynthesisVoice | null;
}

function getVoices(): VoicePair {
  const voices = window.speechSynthesis.getVoices();

  const femaleNames = [
    "Google US English",
    "Google UK English Female",
    "Microsoft Zira",
    "Samantha",
    "Karen",
    "Victoria",
  ];
  const maleNames = [
    "Google UK English Male",
    "Microsoft David",
    "Alex",
    "Daniel",
    "Fred",
  ];

  let female: SpeechSynthesisVoice | null = null;
  let male: SpeechSynthesisVoice | null = null;

  for (const name of femaleNames) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) { female = v; break; }
  }
  for (const name of maleNames) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) { male = v; break; }
  }

  // Fallback: just pick any English voices
  const enVoices = voices.filter((v) => v.lang.startsWith("en"));
  if (!female && enVoices.length > 0) female = enVoices[0];
  if (!male && enVoices.length > 1) male = enVoices[1];
  if (!male) male = female;

  const fallback = female ?? voices.find((v) => v.lang === "en-US") ?? null;

  return { female, male, fallback };
}

interface Segment {
  speaker: "woman" | "man" | "narrator";
  text: string;
}

function parseDialogue(text: string): Segment[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const segments: Segment[] = [];

  for (const line of lines) {
    const match = line.match(/^(Woman|Man|Speaker\s*\d*):\s*(.+)/i);
    if (match) {
      const speaker = match[1].toLowerCase().startsWith("woman") ? "woman" as const
        : match[1].toLowerCase().startsWith("man") ? "man" as const
        : "narrator" as const;
      segments.push({ speaker, text: match[2].trim() });
    } else {
      segments.push({ speaker: "narrator", text: line.trim() });
    }
  }
  return segments;
}

export default function AudioPlayer({ text, mode = "single", choices }: Props) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(0.85);
  const voicesRef = useRef<VoicePair>({ female: null, male: null, fallback: null });

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    const loadVoices = () => {
      voicesRef.current = getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakSegments = useCallback((segments: Segment[]) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const voices = voicesRef.current;
    let index = 0;
    setPlaying(true);

    const speakNext = () => {
      if (index >= segments.length) {
        setPlaying(false);
        return;
      }
      const seg = segments[index];
      const utterance = new SpeechSynthesisUtterance(seg.text);
      utterance.lang = "en-US";
      utterance.rate = rate;

      if (seg.speaker === "woman") {
        utterance.pitch = 1.1;
        if (voices.female) utterance.voice = voices.female;
      } else if (seg.speaker === "man") {
        utterance.pitch = 0.8;
        if (voices.male) utterance.voice = voices.male;
      } else {
        utterance.pitch = 1.0;
        if (voices.fallback) utterance.voice = voices.fallback;
      }

      utterance.onend = () => {
        index++;
        // Longer pause after the last segment (e.g. after choice D)
        const pause = index >= segments.length ? 1500 : 800;
        setTimeout(speakNext, pause);
      };
      utterance.onerror = () => {
        setPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [rate]);

  const speak = useCallback(() => {
    if (mode === "dialogue") {
      const segments = parseDialogue(text);
      speakSegments(segments);
    } else if (mode === "choices" && choices) {
      // Part 1: read label (A, B, C, D) then choice text with pauses
      const segments: Segment[] = choices.map((c) => ({
        speaker: "narrator" as const,
        text: `${c.label}. ${c.text}`,
      }));
      speakSegments(segments);
    } else {
      // Simple single utterance
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setSupported(false);
        return;
      }
      window.speechSynthesis.cancel();
      const voices = voicesRef.current;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = 1.0;
      if (voices.fallback) utterance.voice = voices.fallback;
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [text, rate, mode, choices, speakSegments]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  if (!supported) {
    return (
      <div className="p-2.5 bg-warning-bg rounded-lg border border-warning/30 text-xs text-muted">
        このブラウザは音声合成に対応していません。
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg border border-border/60 px-4 py-2.5">
      <button
        onClick={playing ? stop : speak}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          playing
            ? "bg-accent/10 text-accent hover:bg-accent/20"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        }`}
        aria-label={playing ? "停止" : "再生"}
      >
        {playing ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button
        onClick={speak}
        className="text-xs text-muted hover:text-primary transition-colors font-medium"
        aria-label="もう一度再生"
      >
        ↻ もう一度
      </button>

      {mode === "dialogue" && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted ml-1">
          <span className="inline-block w-2 h-2 rounded-full bg-pink-400" />♀
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 ml-1" />♂
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-[10px] text-muted">速度</span>
        <div className="flex gap-1">
          {[
            { label: "遅", value: 0.7 },
            { label: "普通", value: 0.85 },
            { label: "速", value: 1.1 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRate(opt.value)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                rate === opt.value
                  ? "bg-primary text-white font-semibold"
                  : "bg-surface-dim text-muted hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
