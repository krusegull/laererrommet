"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function ConversationClient({
  currentUserId,
  otherUserId,
  initialMessages,
}: {
  currentUserId: string;
  otherUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/meldinger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherUserId, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å sende meldingen.");
        setSending(false);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: data.message.id,
          senderId: currentUserId,
          content: data.message.content,
          createdAt: data.message.createdAt,
        },
      ]);
      setInput("");
      setSending(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-card border border-line bg-background shadow-card">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-foreground/50">
            Ingen meldinger ennå. Si hei!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] whitespace-pre-wrap rounded-card px-4 py-2 text-sm ${
                      isMine ? "bg-primary text-white" : "bg-background-subtle text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-1 text-sm text-error">{error}</p>}

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv en melding…"
            disabled={sending}
            className="flex-1 rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={send}
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
