"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

export function IdebankContent({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 border-b border-line pb-2 text-xl font-bold text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 text-base font-semibold text-primary">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-3 text-sm font-semibold text-foreground/80">{children}</h3>
          ),
          p: ({ children }) => <p className="text-foreground/80">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 text-foreground/80">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5 text-foreground/80">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-background-subtle px-1 py-0.5 text-xs">{children}</code>
          ),
          hr: () => <hr className="my-6 border-line" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
