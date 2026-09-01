import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { osloDayBounds, isOsloFriday, formatOsloTime } from "@/lib/osloDate";

/**
 * Kjøres én gang daglig via Vercel Cron (se vercel.json), rundt kl. 07 norsk
 * tid. Dette er den faste, ikke-valgfrie 24-timers påminnelsen for
 * kalenderhendelser og terminliste, pluss en valgfri fredags-ukesoversikt.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { start, end } = osloDayBounds(1);

  const events = await prisma.calendarEvent.findMany({
    where: { date: { gte: start, lt: end }, reminderSent: false },
    include: { user: { select: { notifyCalendar: true } } },
  });

  for (const event of events) {
    if (event.user.notifyCalendar) {
      await createNotification(
        event.userId,
        `kalender:${event.category}`,
        `Påminnelse: ${event.title}`,
        formatOsloTime(event.date) + (event.location ? ` · ${event.location}` : ""),
        "/kalender"
      );
    }
    await prisma.calendarEvent.update({ where: { id: event.id }, data: { reminderSent: true } });
  }

  const terminEvents = await prisma.terminlisteEvent.findMany({
    where: { date: { gte: start, lt: end }, reminderSent: false },
  });

  if (terminEvents.length > 0) {
    const recipients = await prisma.user.findMany({
      where: { notifyCalendar: true },
      select: { id: true },
    });
    for (const event of terminEvents) {
      for (const recipient of recipients) {
        await createNotification(
          recipient.id,
          "kalender:terminliste",
          `Terminliste (${event.grade}): ${event.title}`,
          formatOsloTime(event.date),
          "/kalender/terminliste"
        );
      }
      await prisma.terminlisteEvent.update({ where: { id: event.id }, data: { reminderSent: true } });
    }
  }

  let digestSent = 0;
  if (isOsloFriday()) {
    const { start: weekStart } = osloDayBounds(1);
    const { end: weekEnd } = osloDayBounds(8);
    const digestUsers = await prisma.user.findMany({ where: { notifyFridayDigest: true } });
    for (const user of digestUsers) {
      const count = await prisma.calendarEvent.count({
        where: { userId: user.id, date: { gte: weekStart, lt: weekEnd } },
      });
      if (count > 0) {
        await createNotification(
          user.id,
          "kalender:ukesoversikt",
          "Ukesoversikt",
          `Du har ${count} ${count === 1 ? "hendelse" : "hendelser"} neste uke.`,
          "/kalender"
        );
        digestSent++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    remindersSent: events.length,
    terminReminders: terminEvents.length,
    digestSent,
  });
}
