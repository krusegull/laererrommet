import Link from "next/link";
import { getServerSession } from "next-auth";
import { MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewConversationSearch } from "./NewConversationSearch";

export default async function MeldingerPage() {
  const session = await getServerSession(authOptions);
  const conversations = await getConversations(session!.user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meldinger</h1>
        <p className="mt-1 text-foreground/60">Direktemeldinger med kolleger.</p>
      </div>

      <NewConversationSearch />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={32} />}
          title="Ingen samtaler ennå"
          description="Søk etter en kollega over for å starte en samtale."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-background shadow-card">
          {conversations.map((c) => (
            <li key={c.userId}>
              <Link
                href={`/meldinger/${c.userId}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-background-subtle"
              >
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">{c.name}</p>
                    <span className="shrink-0 text-xs text-foreground/40">
                      {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(
                        new Date(c.lastMessageAt)
                      )}
                    </span>
                  </div>
                  <p className="truncate text-sm text-foreground/60">{c.lastMessage}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Uleste meldinger" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
