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
  const seq: StudentLite[] = [];
  let bi = 0;
  let gi = 0;
  while (bi < boys.length || gi < girls.length) {
    if (bi < boys.length) seq.push(boys[bi++]);
    if (gi < girls.length) seq.push(girls[gi++]);
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
