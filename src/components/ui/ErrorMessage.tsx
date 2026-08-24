import { Button } from "./Button";

export function ErrorMessage({
  message = "Noe gikk galt. Prøv gjerne igjen.",
  onRetry,
  retryLabel = "Prøv igjen",
}: {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-error/20 bg-error/5 px-5 py-6 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm text-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
