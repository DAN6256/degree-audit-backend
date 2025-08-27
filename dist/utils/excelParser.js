"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStudents = parseStudents;
const xlsx = __importStar(require("xlsx"));
//Not used. I started with that but if it works do not touch
function parseStudents(fileBuffer) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    const studentsMap = {};
    for (const row of rows) {
        const appNo = row['Application No'] ? String(row['Application No']).trim() : undefined;
        const name = row['Name'] ? String(row['Name']).trim() : undefined;
        const program = row['Program'] ? String(row['Program']).trim() : undefined;
        const courseCode = row['Course'] ? String(row['Course']).trim() : undefined;
        const category = row['Category'] ? String(row['Category']).trim() : undefined;
        const subCategory = row['Sub-Category'] ? String(row['Sub-Category']).trim() : undefined;
        const courseCreditsRaw = row['Course Credits'];
        const courseCredits = typeof courseCreditsRaw === 'number' ? courseCreditsRaw : parseFloat(courseCreditsRaw);
        const earnedCreditsRaw = row['Student Earned Credits'];
        const earnedCredits = typeof earnedCreditsRaw === 'number' ? earnedCreditsRaw : parseFloat(earnedCreditsRaw);
        const grade = row['Grade'] ? String(row['Grade']).trim() : '';
        if (!appNo || !courseCode) {
            continue;
        }
        if (!studentsMap[appNo]) {
            studentsMap[appNo] = {
                applicationNo: appNo,
                name: name || '',
                program: program || '',
                courses: [],
            };
        }
        const course = {
            code: courseCode,
            category: category || '',
            subCategory: subCategory || '',
            credits: Number.isNaN(courseCredits) ? 0 : courseCredits,
            earnedCredits: Number.isNaN(earnedCredits) ? 0 : earnedCredits,
            grade: grade,
        };
        studentsMap[appNo].courses.push(course);
    }
    return Object.values(studentsMap);
}
