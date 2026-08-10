import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export const VEILEDER_SYSTEM_PROMPT = `Du er en KI-assistent for lærere i Osloskolen. Svar alltid: (1) direkte ja eller nei, (2) kort begrunnelse, (3) praktisk tips. Norsk bokmål. Kjenn Osloskolens retningslinjer: del aldri elevopplysninger med KI, KI erstatter ikke lærerens skjønn, oppgi kilde ved KI-generert innhold.`;
