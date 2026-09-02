import fs from "fs";
import path from "path";
import { Card } from "@/components/ui/Card";
import { IdebankContent } from "./IdebankContent";

export default function AdminIdebankPage() {
  const filePath = path.join(process.cwd(), "docs/idebank.md");
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/60">
        Ideer og strategiske vurderinger notert underveis, hentet direkte fra{" "}
        <code className="rounded bg-background-subtle px-1 py-0.5 text-xs">docs/idebank.md</code> på{" "}
        <code className="rounded bg-background-subtle px-1 py-0.5 text-xs">main</code>. Redigeres
        fortsatt via Claude Code, ikke her.
      </p>
      <Card>
        <IdebankContent content={content} />
      </Card>
    </div>
  );
}
