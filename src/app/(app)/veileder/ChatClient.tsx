"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ReportErrorButton } from "@/components/ReportErrorButton";
import { Avatar } from "@/components/ui/Avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_SUGGESTIONS = [
  "Har jeg lov til å stå foran klassen og bruke ChatGPT på storskjerm?",
  "Kan jeg lime inn en elevtekst i ChatGPT for å gi tilbakemelding?",
  "Kan elever bruke KI til å skrive en stil?",
  "Er det greit å anonymisere elevtekster før jeg bruker KI?",
  "Kan jeg bruke KI til å lage prøver og vurderingskriterier?",
  "Kan jeg be KI om hjelp til å skrive IOP for en elev?",
  "Hva er forskjellen på Osloskolens chatbot og ChatGPT?",
];

const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ChatClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<{ content: string; error: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setFailed(null);
    setInput("");
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: "user", content: trimmed }]);
    setSending(true);

    let lastError = "Klarte ikke å nå KI-veilederen.";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed }),
        });

        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { id: data.message.id, role: "assistant", content: data.message.content },
          ]);
          setSending(false);
          return;
        }

        const data = await res.json().catch(() => ({}));
        lastError = data.error ?? lastError;
      } catch {
        lastError = "Nettverksfeil. Sjekk internettforbindelsen din.";
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(600 * attempt);
      }
    }

    setSending(false);
    setFailed({ content: trimmed, error: lastError });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-card border border-line bg-background shadow-card">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-sm text-sm text-foreground/60">
              Spør meg om hva som helst knyttet til KI-bruk i undervisningen. Her er noen
              eksempler for å komme i gang:
            </p>
            <div className="flex flex-col gap-2">
              {STARTER_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-button border border-line px-3 py-2 text-left text-sm text-foreground/80 hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {message.role === "assistant" ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    L
                  </span>
                ) : (
                  <Avatar name="Du" size="sm" />
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-card px-4 py-2.5 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-background-subtle text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  L
                </span>
                <div className="rounded-card bg-background-subtle px-4 py-3 text-primary">
                  <LoadingDots />
                </div>
              </div>
            )}
            {failed && (
              <div className="flex flex-col gap-2">
                <ErrorMessage message={failed.error} onRetry={() => sendMessage(failed.content)} />
                <ReportErrorButton
                  page="/veileder"
                  description={`Chat feilet etter ${MAX_ATTEMPTS} forsøk: ${failed.content}`}
                  error={failed.error}
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv et spørsmål… (Enter for å sende, Shift+Enter for linjeskift)"
            rows={1}
            disabled={sending}
            className="max-h-32 flex-1 resize-none rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            aria-label="Send melding"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
