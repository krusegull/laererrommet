"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createFeedbackLog } from "../actions";

export function NewFeedbackButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} /> Ny tilbakemelding
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ny tilbakemelding">
        <form
          action={async (formData) => {
            await createFeedbackLog(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="studentId" value={studentId} />
          <Input label="Oppgave" name="task" required placeholder="F.eks. Norsk stil om høsten" />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Hva var bra?</span>
            <textarea
              name="positive"
              required
              rows={3}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Hva kan bli bedre?</span>
            <textarea
              name="improve"
              required
              rows={3}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="hasProgress" className="h-4 w-4 accent-[var(--color-primary)]" />
            Eleven viser fremgang siden sist
          </label>
          <Button type="submit" className="self-end">
            Lagre
          </Button>
        </form>
      </Modal>
    </>
  );
}
