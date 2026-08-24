"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

interface UserResult {
  id: string;
  name: string;
  school: string | null;
  subject: string | null;
}

export function NewConversationSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/brukere?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.users);
          setOpen(true);
        }
      } catch {
        // stille feil — søk er ikke kritisk funksjonalitet
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
        <Input
          placeholder="Søk etter en kollega for å starte en ny samtale…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9"
        />
      </div>

      {open && query.trim().length >= 2 && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-card border border-line bg-background p-1 shadow-card">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  router.push(`/meldinger/${user.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-button px-3 py-2 text-left hover:bg-background-subtle"
              >
                <Avatar name={user.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  {(user.subject || user.school) && (
                    <p className="text-xs text-foreground/50">
                      {[user.subject, user.school].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
