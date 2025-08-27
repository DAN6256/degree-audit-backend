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
exports.getCriteriaHandler = getCriteriaHandler;
exports.createOrUpdateCriteriaHandler = createOrUpdateCriteriaHandler;
exports.deleteCriteriaHandler = deleteCriteriaHandler;
exports.getSemesterByYearGroupProgramSemester = getSemesterByYearGroupProgramSemester;
exports.saveSemesterByYearGroupProgramSemester = saveSemesterByYearGroupProgramSemester;
const firebaseService_1 = require("../services/firebaseService");
function getCriteriaHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { major, year, semester } = req.params;
            const yearNum = parseInt(year, 10);
            if (!major || Number.isNaN(yearNum) || !semester) {
                res.status(400).json({ message: 'Missing or invalid parameters' });
                return;
            }
            const criteria = yield (0, firebaseService_1.getCriteria)(major, yearNum, semester);
            if (!criteria) {
                res.status(404).json({ message: 'Criteria not found' });
                return;
            }
            res.status(200).json(criteria);
        }
        catch (err) {
            next(err);
        }
    });
}
function createOrUpdateCriteriaHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const criteria = req.body;
            if (!(criteria === null || criteria === void 0 ? void 0 : criteria.major) || !(criteria === null || criteria === void 0 ? void 0 : criteria.year) || !(criteria === null || criteria === void 0 ? void 0 : criteria.semester)) {
                res.status(400).json({ message: 'Invalid criteria payload' });
                return;
            }
            yield (0, firebaseService_1.saveCriteria)(criteria);
            res.status(200).json({ message: 'Criteria saved successfully' });
        }
        catch (err) {
            next(err);
        }
    });
}
function deleteCriteriaHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { major, year, semester } = req.params;
            const yearNum = parseInt(year, 10);
            if (!major || Number.isNaN(yearNum) || !semester) {
                res.status(400).json({ message: 'Missing or invalid parameters' });
                return;
            }
            yield (0, firebaseService_1.deleteCriteria)(major, yearNum, semester);
            res.status(200).json({ message: 'Criteria removed' });
        }
        catch (err) {
            next(err);
        }
    });
}
function getSemesterByYearGroupProgramSemester(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const yearGroup = parseInt(req.params.yearGroup, 10);
            const program = decodeURIComponent(req.params.program || '');
            const semester = decodeURIComponent(req.params.semester || '');
            if (!Number.isFinite(yearGroup) || !program || !semester) {
                res.status(400).json({ message: 'yearGroup, program, semester are required' });
                return;
            }
            const data = yield (0, firebaseService_1.getSemesterDataSvc)(yearGroup, program, semester);
            res.json(data || { slots: [], rules: [] });
        }
        catch (err) {
            next(err);
        }
    });
}
function saveSemesterByYearGroupProgramSemester(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const yearGroup = parseInt(req.params.yearGroup, 10);
            const program = decodeURIComponent(req.params.program || '');
            const semester = decodeURIComponent(req.params.semester || '');
            if (!Number.isFinite(yearGroup) || !program || !semester) {
                res.status(400).json({ message: 'yearGroup, program, semester are required' });
                return;
            }
            yield (0, firebaseService_1.saveSemesterDataSvc)(yearGroup, program, semester, req.body || { slots: [], rules: [] });
            res.json({ ok: true });
        }
        catch (err) {
            next(err);
        }
    });
}
