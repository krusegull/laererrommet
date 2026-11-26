import type { Grupper, LockEntry, PairHistory, Pod, PodSeats, StudentLite } from "./types";

export function shuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Fjerner lås som peker på elever eller seter som ikke lenger finnes. */
export function validLocks(locks: LockEntry[], students: StudentLite[], podLayout: Pod[]): LockEntry[] {
  const studentIds = new Set(students.map((s) => s.id));
  return locks.filter((l) => {
    const pod = podLayout[l.podIndex];
    return pod && l.seatIndex < pod.size && studentIds.has(l.studentId);
  });
}

/**
 * Plasserer låste elever på sin faste plass, og randomiserer resten
 * gutt/jente-alternerende i de gjenværende setene.
 */
export function generateSeating(
  students: StudentLite[],
  podLayout: Pod[],
  locks: LockEntry[]
): { pods: PodSeats; locks: LockEntry[] } {
  const keptLocks = validLocks(locks, students, podLayout);
  const lockedIds = new Set(keptLocks.map((l) => l.studentId));
  const remaining = students.filter((s) => !lockedIds.has(s.id));

  const boys = shuffle(remaining.filter((s) => s.gender === "gutt"));
  const girls = shuffle(remaining.filter((s) => s.gender === "jente"));
  // Elever uten registrert kjønn blandes inn tilfeldig.
  const others = shuffle(remaining.filter((s) => s.gender !== "gutt" && s.gender !== "jente"));
  const seq: StudentLite[] = [];
  let bi = 0;
  let gi = 0;
  let oi = 0;
  while (bi < boys.length || gi < girls.length || oi < others.length) {
    if (bi < boys.length) seq.push(boys[bi++]);
    if (gi < girls.length) seq.push(girls[gi++]);
    if (oi < others.length) seq.push(others[oi++]);
  }

  const pods: PodSeats = podLayout.map((pod) => new Array(pod.size).fill(null));
  keptLocks.forEach((l) => {
    pods[l.podIndex][l.seatIndex] = l.studentId;
  });

  let cursor = 0;
  pods.forEach((seats) => {
    for (let i = 0; i < seats.length; i++) {
      if (seats[i] === null) {
        seats[i] = seq[cursor] ? seq[cursor].id : null;
        cursor++;
      }
    }
  });

  return { pods, locks: keptLocks };
}

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

export function historyCount(pairHistory: PairHistory, a: string, b: string): number {
  return pairHistory[pairKey(a, b)] ?? 0;
}

export function recordHistory(pairHistory: PairHistory, groups: Grupper): PairHistory {
  const next = { ...pairHistory };
  groups.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const key = pairKey(group[i], group[j]);
        next[key] = (next[key] ?? 0) + 1;
      }
    }
  });
  return next;
}

export function randomGroups(students: StudentLite[], size: number): Grupper {
  const shuffled = shuffle(students).map((s) => s.id);
  const groups: Grupper = [];
  for (let i = 0; i < shuffled.length; i += size) {
    groups.push(shuffled.slice(i, i + size));
  }
  return groups;
}

function clearStudent(pods: PodSeats, studentId: string) {
  for (const seats of pods) {
    for (let i = 0; i < seats.length; i++) {
      if (seats[i] === studentId) seats[i] = null;
    }
  }
}

/**
 * Bygger et gyldig sete-oppsett fra KI-ens forslag: forkaster ugyldige/
 * doble elev-id-er, tvinger gjennom låste plasser (selv om KI-en overså
 * dem), og fyller eventuelle elever KI-en glemte inn i ledige seter.
 * Garanterer at resultatet alltid matcher podLayout nøyaktig, uansett
 * hvor rotete KI-svaret er.
 */
export function repairPods(
  aiPods: unknown,
  podLayout: Pod[],
  students: StudentLite[],
  locks: LockEntry[]
): PodSeats {
  const validIds = new Set(students.map((s) => s.id));
  const pods: PodSeats = podLayout.map((p) => new Array(p.size).fill(null));
  const used = new Set<string>();

  if (Array.isArray(aiPods)) {
    for (let i = 0; i < podLayout.length && i < aiPods.length; i++) {
      const group = aiPods[i];
      if (!Array.isArray(group)) continue;
      for (let s = 0; s < podLayout[i].size; s++) {
        const id = group[s];
        if (typeof id === "string" && validIds.has(id) && !used.has(id)) {
          pods[i][s] = id;
          used.add(id);
        }
      }
    }
  }

  validLocks(locks, students, podLayout).forEach((l) => {
    if (pods[l.podIndex][l.seatIndex] === l.studentId) return;
    const current = pods[l.podIndex][l.seatIndex];
    if (current) used.delete(current);
    if (used.has(l.studentId)) clearStudent(pods, l.studentId);
    pods[l.podIndex][l.seatIndex] = l.studentId;
    used.add(l.studentId);
  });

  const unplaced = students.filter((s) => !used.has(s.id));
  let ui = 0;
  for (const seats of pods) {
    for (let s = 0; s < seats.length; s++) {
      if (seats[s] === null && ui < unplaced.length) {
        seats[s] = unplaced[ui++].id;
      }
    }
  }

  return pods;
}
