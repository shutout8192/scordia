"use client";
import { useEffect, useRef } from "react";

interface Props {
  slot: string;
  format?: "horizontal" | "rectangle" | "auto";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner({ slot, format = "auto", className = "" }: Props) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  const heightClass =
    format === "horizontal"
      ? "min-h-[90px] md:min-h-[90px]"
      : format === "rectangle"
        ? "min-h-[250px]"
        : "min-h-[100px]";

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className={`w-full max-w-[728px] ${heightClass} bg-surface border border-border rounded-lg flex items-center justify-center`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format={format === "auto" ? "auto" : undefined}
          data-full-width-responsive="true"
        />
        {/* Placeholder shown until AdSense is configured */}
        <span className="text-foreground/30 text-xs absolute pointer-events-none">広告スペース</span>
      </div>
    </div>
  );
}
