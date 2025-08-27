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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeProgramKey = sanitizeProgramKey;
exports.getSemesterData = getSemesterData;
exports.saveSemesterData = saveSemesterData;
const firebaseService_1 = require("./firebaseService");
function sanitizeProgramKey(input) {
    return (input || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // collapse any run of non-alphanum to underscore
        .replace(/^_+|_+$/g, ''); // trim leading/trailing underscores
}
function stripUndefined(obj) {
    if (Array.isArray(obj)) {
        return obj.map(stripUndefined);
    }
    if (obj && typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
            if (v === undefined)
                continue;
            out[k] = stripUndefined(v);
        }
        return out;
    }
    return obj;
}
function sanitizeSlot(s) {
    const base = {
        id: String((s === null || s === void 0 ? void 0 : s.id) || ''),
        title: String((s === null || s === void 0 ? void 0 : s.title) || ''),
        kind: (s === null || s === void 0 ? void 0 : s.kind) === 'elective' ? 'elective' : 'required',
        minGrade: (s === null || s === void 0 ? void 0 : s.minGrade) ? String(s.minGrade) : 'D',
        priority: Number.isFinite(Number(s === null || s === void 0 ? void 0 : s.priority)) ? Number(s.priority) : ((s === null || s === void 0 ? void 0 : s.kind) === 'required' ? 0 : 50),
        tag: (s === null || s === void 0 ? void 0 : s.tag) ? String(s.tag) : undefined,
    };
    if (base.kind === 'required') {
        return stripUndefined(Object.assign(Object.assign({}, base), { courseName: String((s === null || s === void 0 ? void 0 : s.courseName) || '') }));
    }
    else {
        const arr = Array.isArray(s === null || s === void 0 ? void 0 : s.allowedCourses) ? s.allowedCourses : [];
        return stripUndefined(Object.assign(Object.assign({}, base), { allowedCourses: arr.map((x) => String(x)).filter(Boolean) }));
    }
}
function sanitizeRule(r) {
    const when = (r === null || r === void 0 ? void 0 : r.when) || {};
    const then = (r === null || r === void 0 ? void 0 : r.then) || {};
    return stripUndefined({
        id: String((r === null || r === void 0 ? void 0 : r.id) || ''),
        name: String((r === null || r === void 0 ? void 0 : r.name) || ''),
        when: {
            anyPassed: Array.isArray(when.anyPassed) ? when.anyPassed.map((x) => String(x)).filter(Boolean) : undefined,
            allPassed: Array.isArray(when.allPassed) ? when.allPassed.map((x) => String(x)).filter(Boolean) : undefined,
        },
        then: {
            waiveSlotsByTitle: Array.isArray(then.waiveSlotsByTitle)
                ? then.waiveSlotsByTitle.map((x) => String(x)).filter(Boolean)
                : undefined,
            waiveCourses: Array.isArray(then.waiveCourses)
                ? then.waiveCourses.map((x) => String(x)).filter(Boolean)
                : undefined,
            addSlots: Array.isArray(then.addSlots)
                ? then.addSlots.map(sanitizeSlot)
                : undefined,
        },
    });
}
function sanitizeSemesterData(data) {
    const slots = Array.isArray(data === null || data === void 0 ? void 0 : data.slots) ? data.slots.map(sanitizeSlot) : [];
    const rules = Array.isArray(data === null || data === void 0 ? void 0 : data.rules) ? data.rules.map(sanitizeRule) : [];
    return stripUndefined({ slots, rules });
}
function getSemesterData(yearGroup, programLabel, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        const programKey = sanitizeProgramKey(programLabel);
        const d = yield (0, firebaseService_1.getSemesterDataSvc)(yearGroup, programKey, semester);
        return d ? sanitizeSemesterData(d) : { slots: [], rules: [] };
    });
}
function saveSemesterData(yearGroup, programLabel, semester, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const programKey = sanitizeProgramKey(programLabel);
        const clean = sanitizeSemesterData(payload);
        yield (0, firebaseService_1.saveSemesterDataSvc)(yearGroup, programKey, semester, clean);
    });
}
