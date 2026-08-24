import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Navn må være minst 2 tegn").max(100),
    email: z.string().trim().toLowerCase().email("Ugyldig e-postadresse"),
    password: z.string().min(8, "Passordet må være minst 8 tegn").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passordene er ikke like",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const onboardingSchema = z.object({
  subject: z.string().trim().max(100).optional(),
  grade: z.string().trim().max(100).optional(),
  school: z.string().trim().max(200).optional(),
  notifyChat: z.boolean().optional(),
  notifyLikes: z.boolean().optional(),
  notifyCalendar: z.boolean().optional(),
  notifyKI: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
});

export const chatMessageSchema = z.object({
  content: z.string().trim().min(1, "Meldingen kan ikke være tom").max(4000),
});

export const studentSchema = z.object({
  label: z.string().trim().min(1, "Navn på elevmerkelapp er påkrevd").max(100),
});

export const feedbackLogSchema = z.object({
  studentId: z.string().min(1),
  task: z.string().trim().min(1, "Oppgave er påkrevd").max(300),
  positive: z.string().trim().min(1, "Fyll inn hva som var bra").max(2000),
  improve: z.string().trim().min(1, "Fyll inn hva som kan bli bedre").max(2000),
  hasProgress: z.boolean().optional(),
});

export const privateNoteSchema = z.object({
  type: z.enum(["kollegatips", "perioderefleksjon", "styrke_svakhet"]),
  content: z.string().trim().min(1, "Innhold kan ikke være tomt").max(4000),
  period: z.string().trim().max(100).optional(),
  source: z.string().trim().max(200).optional(),
});

export const STRENGTH_CATEGORIES = [
  { key: "klasseledelse", label: "Klasseledelse" },
  { key: "fagligDyktighet", label: "Faglig dyktighet" },
  { key: "relasjonsbygging", label: "Relasjonsbygging" },
  { key: "kreativitet", label: "Kreativitet" },
  { key: "disiplin", label: "Disiplin" },
  { key: "tilpasningsevne", label: "Tilpasningsevne" },
] as const;

export const strengthsAssessmentSchema = z.object({
  klasseledelse: z.number().int().min(1).max(5),
  fagligDyktighet: z.number().int().min(1).max(5),
  relasjonsbygging: z.number().int().min(1).max(5),
  kreativitet: z.number().int().min(1).max(5),
  disiplin: z.number().int().min(1).max(5),
  tilpasningsevne: z.number().int().min(1).max(5),
});

export type StrengthsAssessment = z.infer<typeof strengthsAssessmentSchema>;

export const reflectionRequestSchema = z.object({
  mode: z.enum(["sporsmal", "oppsummer", "utenfra"]),
  period: z.string().trim().max(100).optional(),
  content: z.string().trim().max(4000).optional(),
});

export const errorReportSchema = z.object({
  page: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1, "Beskriv hva som gikk galt").max(2000),
  error: z.string().trim().max(4000).optional(),
});
