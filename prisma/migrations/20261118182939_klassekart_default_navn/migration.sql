-- AlterTable
ALTER TABLE "SeatingChart" ALTER COLUMN "label" SET DEFAULT 'Kart 1';

-- "Klassekart" som kart-navn kolliderer visuelt med fanen "Klassekart" i UI-et.
-- Rett opp eksisterende rader som fortsatt har det gamle standardnavnet
-- (ikke rader der læreren selv har skrevet inn "Klassekart" som navn - det
-- skiller vi ikke fra her, men det er et usannsynlig tilfeldig navnevalg).
UPDATE "SeatingChart" SET "label" = 'Kart 1' WHERE "label" = 'Klassekart';
