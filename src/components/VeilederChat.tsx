"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STARTER_PROMPTS = [
  "Har jeg lov til å stå foran klassen og bruke ChatGPT på storskjerm?",
  "Kan jeg lime inn en elevtekst i ChatGPT for å gi tilbakemelding?",
  "Kan elever bruke KI til å skrive en stil?",
  "Kan jeg bruke KI til å lage prøver og vurderingskriterier?",
  "Kan jeg be KI om hjelp til å skrive IOP for en elev?",
];

export function VeilederChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Noe gikk galt");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="mt-6 flex flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex-1 space-y-4 overflow-y-auto p-6" style={{ minHeight: "20rem" }}>
        {messages.length === 0 && (
          <div>
            <p className="text-sm font-medium text-foreground/70">Kom i gang med et spørsmål:</p>
            <div className="mt-3 flex flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-xl border border-primary/20 bg-primary-light px-4 py-2 text-left text-sm text-primary transition hover:bg-primary/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-secondary-light text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-secondary-light px-4 py-2.5 text-sm text-foreground/60">
              Veilederen tenker …
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="border-t border-black/5 p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Skriv et spørsmål … (Enter for å sende, Shift+Enter for linjeskift)"
            className="flex-1 resize-none rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
