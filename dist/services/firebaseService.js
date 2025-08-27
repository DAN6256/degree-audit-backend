"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCriteria = getCriteria;
exports.saveCriteria = saveCriteria;
exports.deleteCriteria = deleteCriteria;
exports.getUserByEmail = getUserByEmail;
exports.createUserRecord = createUserRecord;
exports.listYearGroupsSvc = listYearGroupsSvc;
exports.upsertYearGroupSvc = upsertYearGroupSvc;
exports.listProgramsSvc = listProgramsSvc;
exports.upsertProgramSvc = upsertProgramSvc;
exports.getProgramMetaSvc = getProgramMetaSvc;
exports.getAllSemestersUpToSvc = getAllSemestersUpToSvc;
exports.getSemesterDataSvc = getSemesterDataSvc;
exports.saveSemesterDataSvc = saveSemesterDataSvc;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const sanitizeKey = (s) => (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
const norm = sanitizeKey;
function initFirebase() {
    if (firebase_admin_1.default.apps.length)
        return;
    const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_DATABASE_URL, } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL || !FIREBASE_DATABASE_URL) {
        throw new Error('Missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_DATABASE_URL');
    }
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey,
        }),
        databaseURL: FIREBASE_DATABASE_URL,
    });
}
function getCriteria(major, year, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const refPath = `criteria/${sanitizeKey(major)}/${year}/${sanitizeKey(semester)}`;
        const snapshot = yield firebase_admin_1.default.database().ref(refPath).get();
        return snapshot.exists() ? snapshot.val() : null;
    });
}
function saveCriteria(criteria) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const { major, cohort, year, semester } = criteria;
        const refPath = `criteria/${sanitizeKey(major)}/${cohort}/${year}/${sanitizeKey(semester)}`;
        const safe = JSON.parse(JSON.stringify(criteria !== null && criteria !== void 0 ? criteria : null));
        yield firebase_admin_1.default.database().ref(refPath).set(safe);
    });
}
function deleteCriteria(major, year, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const refPath = `criteria/${sanitizeKey(major)}/${year}/${sanitizeKey(semester)}`;
        yield firebase_admin_1.default.database().ref(refPath).remove();
    });
}
function normalizeEmail(email) {
    return (email || '').replace(/\./g, ',').toLowerCase();
}
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const key = normalizeEmail(email);
        const snapshot = yield firebase_admin_1.default.database().ref(`users/${key}`).get();
        return snapshot.exists() ? snapshot.val() : null;
    });
}
function createUserRecord(email, passwordHash, name) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const key = normalizeEmail(email);
        yield firebase_admin_1.default.database().ref(`users/${key}`).set({ email, passwordHash, name });
    });
}
function listYearGroupsSvc() {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const snap = yield firebase_admin_1.default.database().ref('yearGroups').get();
        if (!snap.exists())
            return [];
        return Object.keys(snap.val() || {})
            .map((k) => parseInt(k, 10))
            .filter((n) => !Number.isNaN(n))
            .sort();
    });
}
function upsertYearGroupSvc(yearGroup) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        yield firebase_admin_1.default
            .database()
            .ref(`yearGroups/${yearGroup}`)
            .update({ updatedAt: firebase_admin_1.default.database.ServerValue.TIMESTAMP });
    });
}
function listProgramsSvc(yearGroup) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const snap = yield firebase_admin_1.default.database().ref(`yearGroups/${yearGroup}/programs`).get();
        if (!snap.exists())
            return [];
        const val = snap.val() || {};
        return Object.values(val).map((p) => {
            var _a, _b;
            return ({
                displayName: ((_a = p.meta) === null || _a === void 0 ? void 0 : _a.displayName) || '',
                defaultPassGrade: ((_b = p.meta) === null || _b === void 0 ? void 0 : _b.defaultPassGrade) || 'D',
            });
        });
    });
}
function upsertProgramSvc(yearGroup, meta) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const key = sanitizeKey(meta.displayName);
        yield firebase_admin_1.default.database().ref(`yearGroups/${yearGroup}/programs/${key}/meta`).set({
            displayName: meta.displayName,
            defaultPassGrade: meta.defaultPassGrade || 'D',
        });
    });
}
function getProgramMetaSvc(yearGroup, programDisplay) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const pkey = sanitizeKey(programDisplay);
        const snap = yield firebase_admin_1.default.database().ref(`yearGroups/${yearGroup}/programs/${pkey}/meta`).get();
        return snap.exists() ? snap.val() : { displayName: programDisplay, defaultPassGrade: 'D' };
    });
}
/** Helper to compare YxSy strings */
function compareSemester(a, b) {
    const parse = (x) => {
        const m = (x || '').toUpperCase().match(/^Y(\d)S(\d)$/);
        if (!m)
            return { y: 9, s: 9 };
        return { y: parseInt(m[1], 10), s: parseInt(m[2], 10) };
    };
    const A = parse(a);
    const B = parse(b || a);
    if (A.y !== B.y)
        return A.y - B.y;
    return A.s - B.s;
}
function getAllSemestersUpToSvc(yearGroup, programDisplay, targetSemester) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const pkey = sanitizeKey(programDisplay);
        const ref = firebase_admin_1.default.database().ref(`yearGroups/${yearGroup}/programs/${pkey}`);
        const snap = yield ref.get();
        if (!snap.exists())
            return { meta: {}, semesters: {} };
        const val = snap.val() || {};
        const semesters = val.semesters || {};
        const ordered = Object.keys(semesters).sort(compareSemester);
        const upto = ordered.filter((s) => compareSemester(s, targetSemester) <= 0);
        const out = {};
        upto.forEach((s) => { out[s] = semesters[s]; });
        return { meta: val.meta || {}, semesters: out };
    });
}
function getSemesterDataSvc(yearGroup, programKeyOrDisplay, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const pkey = sanitizeKey(programKeyOrDisplay);
        const skey = (semester || '').toUpperCase();
        const path = `yearGroups/${yearGroup}/programs/${pkey}/semesters/${skey}`;
        const snap = yield firebase_admin_1.default.database().ref(path).get();
        return snap.exists() ? snap.val() : { slots: [], rules: [] };
    });
}
function saveSemesterDataSvc(yearGroup, programKeyOrDisplay, semester, data) {
    return __awaiter(this, void 0, void 0, function* () {
        initFirebase();
        const pkey = sanitizeKey(programKeyOrDisplay);
        const skey = (semester || '').toUpperCase();
        const safe = JSON.parse(JSON.stringify(data !== null && data !== void 0 ? data : null));
        const path = `yearGroups/${yearGroup}/programs/${pkey}/semesters/${skey}`;
        yield firebase_admin_1.default.database().ref(path).set(safe);
    });
}
