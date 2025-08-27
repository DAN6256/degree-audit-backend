"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGradePassing = isGradePassing;
exports.normalizeGrade = normalizeGrade;
//Just for comparison
const gradeRank = {
    'A+': 13,
    'A': 12,
    'A-': 11,
    'B+': 10,
    'B': 9,
    'B-': 8,
    'C+': 7,
    'C': 6,
    'C-': 5,
    'D+': 4,
    'D': 3,
    'E': 2,
    'F': 1,
    'P': 8, // For a special case (Ashesi success)
    'I': 0,
    '': 0,
};
/**
 * Determine whether a student's grade meets the minimum required grade.  If
 * either grade is missing from the ranking table the comparison is treated
 * conservatively and returns false.
 *
 * @param grade Student's achieved grade (e.g. "C+")
 * @param minGrade Minimum acceptable grade (e.g. "D")
 */
function isGradePassing(grade, minGrade) {
    const achieved = gradeRank[grade.trim().toUpperCase()];
    const required = gradeRank[minGrade.trim().toUpperCase()];
    if (achieved === undefined || required === undefined) {
        return false;
    }
    return achieved >= required;
}
/**
 * Normalize grade strings.  Removes extraneous whitespace and capitalises
 * letters to match the gradeRank keys.
 */
function normalizeGrade(g) {
    return g.trim().toUpperCase();
}
