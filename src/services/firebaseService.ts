import admin from 'firebase-admin';
import { Criteria } from '../models/criteria';
import { ProgramMeta, SemesterData } from '../models/curriculum';


const sanitizeKey = (s: string) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const norm = sanitizeKey;

function initFirebase(): void {
  if (admin.apps.length) return;

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_DATABASE_URL,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL || !FIREBASE_DATABASE_URL) {
    throw new Error(
      'Missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_DATABASE_URL'
    );
  }

  const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    databaseURL: FIREBASE_DATABASE_URL,
  });
}

export async function getCriteria(major: string, year: number, semester: string): Promise<Criteria | null> {
  initFirebase();
  const refPath = `criteria/${sanitizeKey(major)}/${year}/${sanitizeKey(semester)}`;
  const snapshot = await admin.database().ref(refPath).get();
  return snapshot.exists() ? (snapshot.val() as Criteria) : null;
}

export async function saveCriteria(criteria: Criteria): Promise<void> {
  initFirebase();
  const { major, cohort, year, semester } = criteria as any;
  const refPath = `criteria/${sanitizeKey(major)}/${cohort}/${year}/${sanitizeKey(semester)}`;
  const safe = JSON.parse(JSON.stringify(criteria ?? null));
  await admin.database().ref(refPath).set(safe);
}

export async function deleteCriteria(major: string, year: number, semester: string): Promise<void> {
  initFirebase();
  const refPath = `criteria/${sanitizeKey(major)}/${year}/${sanitizeKey(semester)}`;
  await admin.database().ref(refPath).remove();
}


function normalizeEmail(email: string): string {
  return (email || '').replace(/\./g, ',').toLowerCase();
}

export async function getUserByEmail(
  email: string
): Promise<{ email: string; passwordHash: string; name?: string } | null> {
  initFirebase();
  const key = normalizeEmail(email);
  const snapshot = await admin.database().ref(`users/${key}`).get();
  return snapshot.exists() ? snapshot.val() : null;
}

// export async function createUserRecord(email: string, passwordHash: string, name?: string): Promise<void> {
//   initFirebase();
//   const key = normalizeEmail(email);
//   await admin.database().ref(`users/${key}`).set({ email, passwordHash, name });
// }
export async function createUserRecord(
  email: string,
  passwordHash: string,
  name?: string
): Promise<void> {
  initFirebase();
  const key = normalizeEmail(email);

  const payload: any = {
    email,
    passwordHash,
  };
  if (typeof name === 'string') {
    // store the provided name (empty string is allowed). Avoid undefined entirely.
    payload.name = name;
  }

  const safe = JSON.parse(JSON.stringify(payload));
  await admin.database().ref(`users/${key}`).set(safe);
}


export async function listYearGroupsSvc(): Promise<number[]> {
  initFirebase();
  const snap = await admin.database().ref('yearGroups').get();
  if (!snap.exists()) return [];
  return Object.keys(snap.val() || {})
    .map((k) => parseInt(k, 10))
    .filter((n) => !Number.isNaN(n))
    .sort();
}

export async function upsertYearGroupSvc(yearGroup: number): Promise<void> {
  initFirebase();
  await admin
    .database()
    .ref(`yearGroups/${yearGroup}`)
    .update({ updatedAt: admin.database.ServerValue.TIMESTAMP });
}

export async function listProgramsSvc(yearGroup: number): Promise<ProgramMeta[]> {
  initFirebase();
  const snap = await admin.database().ref(`yearGroups/${yearGroup}/programs`).get();
  if (!snap.exists()) return [];
  const val = snap.val() || {};
  return Object.values(val).map((p: any) => ({
    displayName: p.meta?.displayName || '',
    defaultPassGrade: p.meta?.defaultPassGrade || 'D',
  }));
}

export async function upsertProgramSvc(yearGroup: number, meta: ProgramMeta): Promise<void> {
  initFirebase();
  const key = sanitizeKey(meta.displayName);
  await admin.database().ref(`yearGroups/${yearGroup}/programs/${key}/meta`).set({
    displayName: meta.displayName,
    defaultPassGrade: meta.defaultPassGrade || 'D',
  });
}

export async function getProgramMetaSvc(yearGroup: number, programDisplay: string) {
  initFirebase();
  const pkey = sanitizeKey(programDisplay);
  const snap = await admin.database().ref(`yearGroups/${yearGroup}/programs/${pkey}/meta`).get();
  return snap.exists() ? snap.val() : { displayName: programDisplay, defaultPassGrade: 'D' };
}

/** Helper to compare YxSy strings */
function compareSemester(a: string, b?: string): number {
  const parse = (x: string) => {
    const m = (x || '').toUpperCase().match(/^Y(\d)S(\d)$/);
    if (!m) return { y: 9, s: 9 };
    return { y: parseInt(m[1], 10), s: parseInt(m[2], 10) };
  };
  const A = parse(a);
  const B = parse(b || a);
  if (A.y !== B.y) return A.y - B.y;
  return A.s - B.s;
}

export async function getAllSemestersUpToSvc(
  yearGroup: number,
  programDisplay: string,
  targetSemester: string
): Promise<{ meta: any; semesters: Record<string, SemesterData> }> {
  initFirebase();
  const pkey = sanitizeKey(programDisplay);
  const ref = admin.database().ref(`yearGroups/${yearGroup}/programs/${pkey}`);
  const snap = await ref.get();
  if (!snap.exists()) return { meta: {}, semesters: {} };
  const val = snap.val() || {};
  const semesters: Record<string, SemesterData> = val.semesters || {};
  const ordered = Object.keys(semesters).sort(compareSemester);
  const upto = ordered.filter((s) => compareSemester(s, targetSemester) <= 0);
  const out: Record<string, SemesterData> = {};
  upto.forEach((s) => { out[s] = semesters[s]; });
  return { meta: val.meta || {}, semesters: out };
}

export async function getSemesterDataSvc(
  yearGroup: number,
  programKeyOrDisplay: string,
  semester: string
): Promise<SemesterData | null> {
  initFirebase();
  const pkey = sanitizeKey(programKeyOrDisplay);
  const skey = (semester || '').toUpperCase();
  const path = `yearGroups/${yearGroup}/programs/${pkey}/semesters/${skey}`;
  const snap = await admin.database().ref(path).get();
  return snap.exists() ? (snap.val() as SemesterData) : { slots: [], rules: [] };
}

export async function saveSemesterDataSvc(
  yearGroup: number,
  programKeyOrDisplay: string,
  semester: string,
  data: SemesterData
): Promise<void> {
  initFirebase();
  const pkey = sanitizeKey(programKeyOrDisplay);
  const skey = (semester || '').toUpperCase();
  const safe = JSON.parse(JSON.stringify(data ?? null));
  const path = `yearGroups/${yearGroup}/programs/${pkey}/semesters/${skey}`;
  await admin.database().ref(path).set(safe);
}
