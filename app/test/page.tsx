"use client";
import { AIProviderSelector } from "@/src/components/ui/card-hover-effect";
import { useState } from "react";

export default function TestPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>("gpt-4");

  return (
    <div>
      <div className="max-w-5xl mx-auto px-8">
        <AIProviderSelector 
          items={providers} 
          selectedProvider={selectedProvider}
          onSelect={(provider) => setSelectedProvider(provider)}
        />
      </div>
    </div>
  );
}

export const providers = [
  {
    title: "gpt-4",
  },
  {
    title: "claude",
  },
  {
    title: "gemini",
  },
];
