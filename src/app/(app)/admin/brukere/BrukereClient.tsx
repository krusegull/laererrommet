"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "Aldri";
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value)
  );
}

export function BrukereClient({
  currentUserId,
  initialUsers,
}: {
  currentUserId: string;
  initialUsers: UserRow[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    const prev = users;
    setUsers((u) => u.map((row) => (row.id === id ? { ...row, role } : row)));
    setError(null);
    try {
      const res = await fetch(`/api/admin/brukere/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Klarte ikke å endre rollen.");
        setUsers(prev);
      }
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setUsers(prev);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="overflow-x-auto rounded-card border border-line bg-background shadow-card">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">Registrert</th>
              <th className="px-4 py-3 font-medium">Siste innlogging</th>
              <th className="px-4 py-3 font-medium">Rolle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-foreground/50">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-foreground/70">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-foreground/70">{formatDate(user.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  {user.id === currentUserId ? (
                    <Badge variant="primary">{user.role} (deg)</Badge>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="rounded-button border border-line bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
