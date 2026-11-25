import { z } from "zod";
import { FAG } from "@/lib/poeng/fag";

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

export const CALENDAR_CATEGORIES = [
  "undervisning",
  "vurdering",
  "leksefrist",
  "moter",
  "personlig",
  "annerledesdag",
] as const;

export const CALENDAR_CATEGORY_LABELS: Record<(typeof CALENDAR_CATEGORIES)[number], string> = {
  undervisning: "Undervisning",
  vurdering: "Vurdering",
  leksefrist: "Leksefrist",
  moter: "Møter",
  personlig: "Personlig",
  annerledesdag: "Annerledes dag",
};

export const calendarEventSchema = z
  .object({
    title: z.string().trim().min(1, "Tittel er påkrevd").max(200),
    description: z.string().trim().max(5000).optional(),
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

export const TIMETABLE_DAY_LABELS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const timetableEntrySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(4),
    startTime: z.string().regex(TIME_REGEX, "Ugyldig klokkeslett"),
    endTime: z.string().regex(TIME_REGEX, "Ugyldig klokkeslett"),
    title: z.string().trim().min(1, "Tittel er påkrevd").max(200),
    notes: z.string().trim().max(2000).optional(),
    subjectId: z.string().trim().min(1).max(100).optional().nullable(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Sluttid må være etter starttid",
    path: ["endTime"],
  });

export const schoolBreakSchema = z
  .object({
    name: z.string().trim().min(1, "Navn er påkrevd").max(100),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Sluttdato må være etter eller lik startdato",
    path: ["endDate"],
  });

export const weeklyNoteCreateSchema = z.object({
  weekStart: z.coerce.date(),
  dayOfWeek: z.number().int().min(0).max(4),
  content: z.string().trim().min(1, "Notatet kan ikke være tomt").max(500),
  priority: z.number().int().min(1).max(3).optional().nullable(),
});

export const weeklyNoteUpdateSchema = z.object({
  content: z.string().trim().min(1, "Notatet kan ikke være tomt").max(500).optional(),
  priority: z.number().int().min(1).max(3).optional().nullable(),
  completed: z.boolean().optional(),
});

export const importantNoteCreateSchema = z.object({
  content: z.string().trim().min(1, "Notatet kan ikke være tomt").max(500),
  priority: z.number().int().min(1).max(3).optional().nullable(),
});

export const importantNoteUpdateSchema = z.object({
  content: z.string().trim().min(1, "Notatet kan ikke være tomt").max(500).optional(),
  priority: z.number().int().min(1).max(3).optional().nullable(),
  completed: z.boolean().optional(),
});

export const ROOM_OBJECT_TYPES = ["dor", "tavle", "vindu", "kateter", "laerer", "bokhylle", "egen"] as const;

export const classProfileCreateSchema = z.object({
  name: z.string().trim().min(1, "Navn på klassen er påkrevd").max(60),
});

export const classProfileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Navn på klassen er påkrevd").max(60),
});

export const classStudentSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd").max(100),
  gender: z.enum(["gutt", "jente"]),
});

export const classStudentsBulkSchema = z.object({
  students: z.array(classStudentSchema).min(1, "Listen er tom").max(100),
});

export const chartCreateSchema = z.object({
  label: z.string().trim().max(60).optional(),
  week: z.number().int().min(1, "Uke må være 1-53").max(53, "Uke må være 1-53").optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
  /** Hvis satt, dupliseres rom/pulter/seter/grupper fra dette kartet som utgangspunkt. */
  cloneFromChartId: z.string().cuid().optional(),
});

export const chartUpdateSchema = z.object({
  label: z.string().trim().min(1, "Navn er påkrevd").max(60).optional(),
  week: z.number().int().min(1, "Uke må være 1-53").max(53, "Uke må være 1-53").optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
});

export const IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

export const importClassImageSchema = z.object({
  imageBase64: z.string().min(1, "Mangler bilde"),
  mediaType: z.enum(IMAGE_MEDIA_TYPES),
});

export const roomObjectSchema = z.object({
  id: z.string().min(1).max(60),
  type: z.enum(ROOM_OBJECT_TYPES),
  label: z.string().trim().min(1, "Navn er påkrevd").max(60),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  w: z.number().min(10).max(220).optional(),
  h: z.number().min(10).max(220).optional(),
});

export const roomObjectsUpdateSchema = z.object({
  roomObjects: z.array(roomObjectSchema).max(60),
});

export const podSchema = z.object({
  id: z.number().int().min(1),
  size: z.number().int().min(1).max(6),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const podLayoutUpdateSchema = z.object({
  podLayout: z.array(podSchema).max(40),
  // false ved ren drag-and-drop av posisjon (ingen grunn til å stokke om elevene),
  // true (default) når antall seter er endret og kartet bør genereres på nytt.
  regenerate: z.boolean().optional(),
});

export const swapSeatSchema = z.object({
  p1: z.number().int().min(0),
  s1: z.number().int().min(0),
  p2: z.number().int().min(0),
  s2: z.number().int().min(0),
  force: z.boolean().optional(),
});

export const generateSeatingSchema = z.object({
  instruks: z.string().trim().max(1000).optional(),
});

export const toggleLockSchema = z.object({
  podIndex: z.number().int().min(0),
  seatIndex: z.number().int().min(0),
});

export const GRUPPER_MODES = ["random", "manuell", "instruks"] as const;

export const grupperRequestSchema = z.object({
  mode: z.enum(GRUPPER_MODES),
  size: z.number().int().min(2).max(10).optional(),
  instruks: z.string().trim().max(1000).optional(),
  manualGroups: z.array(z.array(z.string().min(1))).max(40).optional(),
});

export const malCreateSchema = z.object({
  name: z.string().trim().min(1, "Navn på malen er påkrevd").max(100),
  description: z.string().trim().max(500).optional(),
});

export const malUpdateSchema = z.object({
  name: z.string().trim().min(1, "Navn på malen er påkrevd").max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
});

export const skalaEntrySchema = z.object({
  label: z.string().trim().min(1, "Mangler navn på karakteren").max(20),
  minScore: z.number().int().min(0).max(100),
});

export const skalaUpdateSchema = z.object({
  skala: z
    .array(skalaEntrySchema)
    .max(20)
    .refine(
      (entries) => entries.every((e, i) => i === 0 || e.minScore > entries[i - 1].minScore),
      "Karaktergrensene må ligge i stigende rekkefølge på poengsum"
    ),
});

export const kriteriumSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Navn på kriteriet er påkrevd").max(100),
  description: z.string().trim().max(500).optional(),
  weight: z.number().int().min(0).max(100),
  ekstraBra: z.string().trim().max(500).optional(),
});

export const kriterierUpdateSchema = z.object({
  kriterier: z
    .array(kriteriumSchema)
    .max(30)
    .refine(
      (list) => list.length === 0 || list.reduce((sum, k) => sum + k.weight, 0) === 100,
      "Vektingen av kriteriene må til sammen bli 100 %"
    ),
});

export const elevTekstCreateSchema = z.object({
  classId: z.string().cuid(),
  classStudentId: z.string().cuid(),
  malId: z.string().cuid(),
  tittel: z.string().trim().min(1, "Tittel er påkrevd").max(150),
  tekst: z.string().trim().min(1, "Teksten kan ikke være tom").max(20000),
  dato: z.string().optional(),
  score: z.number().int().min(0).max(100).optional().nullable(),
  tilbakemelding: z.string().trim().max(5000).optional(),
});

export const maalUpsertSchema = z.object({
  studentId: z.string().cuid(),
  malId: z.string().cuid(),
  elevMaal: z.string().trim().max(50).optional().nullable(),
  laererMaal: z.string().trim().max(50).optional().nullable(),
  notat: z.string().trim().max(1000).optional().nullable(),
});

export const elevTekstKommentarCreateSchema = z
  .object({
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(0),
    kommentar: z.string().trim().min(1, "Kommentaren kan ikke være tom").max(1000),
  })
  .refine((d) => d.endOffset > d.startOffset, { message: "Ugyldig tekstutvalg" });

export const elevTekstKommentarUpdateSchema = z.object({
  kommentar: z.string().trim().min(1, "Kommentaren kan ikke være tom").max(1000),
});

export const kriterieVurderingEntrySchema = z.object({
  kriteriumId: z.string(),
  kriteriumName: z.string().max(100),
  weight: z.number().int().min(0).max(100),
  poengandel: z.number().int().min(0).max(100),
  kommentar: z.string().max(1000),
  ekstraBraOppfylt: z.boolean().nullable(),
});

export const elevTekstUpdateSchema = z.object({
  tittel: z.string().trim().min(1, "Tittel er påkrevd").max(150).optional(),
  tekst: z.string().trim().min(1, "Teksten kan ikke være tom").max(20000).optional(),
  dato: z.string().optional(),
  score: z.number().int().min(0).max(100).optional().nullable(),
  tilbakemelding: z.string().trim().max(5000).optional().nullable(),
  kriterieVurdering: z.array(kriterieVurderingEntrySchema).max(30).optional().nullable(),
});

export const elevPoengSchema = z.object({
  classStudentIds: z.array(z.string().min(1)).min(1, "Velg minst én elev").max(60),
  fag: z.enum(FAG, { message: "Velg et fag" }),
  poeng: z
    .number({ message: "Skriv inn antall poeng" })
    .int("Poeng må være et helt tall")
    .min(-1000, "For mange minuspoeng")
    .max(1000, "Maks 1000 poeng om gangen")
    .refine((n) => n !== 0, "Poeng kan ikke være 0"),
  tema: z.string().trim().min(1, "Skriv periode/tema").max(120),
  kilde: z.string().trim().max(200).optional().default(""),
  gruppe: z.string().trim().max(60).optional(),
  /** ISO-dato (YYYY-MM-DD). Udefinert = i dag. */
  dato: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig dato")
    .optional(),
});
