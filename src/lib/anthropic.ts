import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

let client: Anthropic | null = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AIUnavailableError extends Error {
  constructor(message = "KI-tjenesten er ikke konfigurert. Kontakt administrator.") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export async function askClaude({
  system,
  messages,
  maxTokens = 1024,
}: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  if (!anthropic) {
    throw new AIUnavailableError();
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      });

      const textBlock = response.content.find((block) => block.type === "text");
      if (textBlock && textBlock.type === "text") {
        return textBlock.text;
      }
      throw new Error("Tomt svar fra KI-tjenesten");
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  console.error("Anthropic API feilet etter flere forsøk:", lastError);
  throw new Error("Klarte ikke å nå KI-tjenesten etter flere forsøk. Prøv igjen om litt.");
}
