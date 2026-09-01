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

export const directMessageSchema = z.object({
  receiverId: z.string().min(1, "Mangler mottaker"),
  content: z.string().trim().min(1, "Meldingen kan ikke være tom").max(2000),
});

export const featureRequestSchema = z.object({
  title: z.string().trim().min(1, "Tittel er påkrevd").max(150),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(["ny funksjon", "forbedring", "feil"]).default("ny funksjon"),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2, "Navn må være minst 2 tegn").max(100).optional(),
  email: z.string().trim().toLowerCase().email("Ugyldig e-postadresse").optional(),
  school: z.string().trim().max(200).optional().nullable(),
  subject: z.string().trim().max(100).optional().nullable(),
  grade: z.string().trim().max(100).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  isPublic: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  notifyChat: z.boolean().optional(),
  notifyLikes: z.boolean().optional(),
  notifyCalendar: z.boolean().optional(),
  notifyKI: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  notifyFridayDigest: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nåværende passord er påkrevd"),
    newPassword: z.string().min(8, "Det nye passordet må være minst 8 tegn").max(100),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "De nye passordene er ikke like",
    path: ["confirmNewPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Passord er påkrevd for å slette kontoen"),
});

export const IDEA_CATEGORIES = ["KI-verktøy", "Pedagogikk", "Fellesskap", "Teknisk", "Annet"] as const;

export const ideaSchema = z.object({
  title: z.string().trim().min(1, "Tittel er påkrevd").max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(IDEA_CATEGORIES).default("Annet"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export const featureRequestStatusSchema = z.object({
  status: z.enum(["innsendt", "under vurdering", "planlagt", "realisert"]),
});

export const studentIdSchema = z.object({
  studentId: z.string().min(1, "Mangler elev-ID"),
});

export const toggleRealizedSchema = z.object({
  realized: z.boolean().optional(),
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

export const LESSON_PLAN_SUBJECTS = [
  "Norsk",
  "Matematikk",
  "Engelsk",
  "Naturfag",
  "Samfunnsfag",
  "KRLE",
  "Kunst og håndverk",
  "Musikk",
  "Kroppsøving",
  "Mat og helse",
  "Fremmedspråk",
  "Tverrfaglig",
  "Annet",
] as const;

export const LESSON_PLAN_GRADE_BANDS = ["Barnetrinn", "Ungdomstrinn", "Videregående", "Alle trinn"] as const;

export const LESSON_PLAN_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const LESSON_PLAN_ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
] as const;

export const lessonPlanSchema = z.object({
  title: z.string().trim().min(1, "Tittel er påkrevd").max(200),
  subject: z.enum(LESSON_PLAN_SUBJECTS),
  grade: z.enum(LESSON_PLAN_GRADE_BANDS),
  description: z.string().trim().min(1, "Kort beskrivelse er påkrevd").max(500),
  content: z.string().trim().max(20000).optional(),
  rightsConfirmed: z.literal(true, {
    message: "Du må bekrefte at du har rett til å dele dette innholdet",
  }),
});

export const lessonPlanRatingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  whatWorked: z.string().trim().max(1000).optional(),
  whatDidntWork: z.string().trim().max(1000).optional(),
});

export const CALENDAR_CATEGORIES = ["undervisning", "vurdering", "leksefrist", "moter", "personlig"] as const;

export const CALENDAR_CATEGORY_LABELS: Record<(typeof CALENDAR_CATEGORIES)[number], string> = {
  undervisning: "Undervisning",
  vurdering: "Vurdering",
  leksefrist: "Leksefrist",
  moter: "Møter",
  personlig: "Personlig",
};

export const calendarEventSchema = z
  .object({
    title: z.string().trim().min(1, "Tittel er påkrevd").max(200),
    description: z.string().trim().max(1000).optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    location: z.string().trim().max(200).optional(),
    category: z.enum(CALENDAR_CATEGORIES).default("undervisning"),
    subjectId: z.string().trim().min(1).max(100).optional().nullable(),
  })
  .refine((data) => !data.endDate || data.endDate > data.date, {
    message: "Sluttid må være etter starttidspunktet",
    path: ["endDate"],
  });

export const calendarSubjectSchema = z.object({
  name: z.string().trim().min(1, "Navn på fag er påkrevd").max(60),
});

export const TERMINLISTE_GRADES = ["8. trinn", "9. trinn", "10. trinn"] as const;

export const terminlisteEventSchema = z.object({
  title: z.string().trim().min(1, "Tittel er påkrevd").max(200),
  description: z.string().trim().max(1000).optional(),
  date: z.coerce.date(),
  grade: z.enum(TERMINLISTE_GRADES),
});
