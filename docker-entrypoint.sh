#!/bin/sh
set -e

mkdir -p "$(dirname "${DATABASE_URL#file:}")"
npx prisma migrate deploy
npx tsx prisma/seed.ts

exec "$@"
