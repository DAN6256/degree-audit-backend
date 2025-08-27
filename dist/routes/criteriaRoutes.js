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
const express_1 = require("express");
const curriculumService_1 = require("../services/curriculumService");
const router = (0, express_1.Router)();
router.get('/:yearGroup/:program/:semester', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const yearGroup = parseInt(req.params.yearGroup, 10);
        const programRaw = decodeURIComponent(req.params.program || '');
        const semester = req.params.semester;
        if (!Number.isFinite(yearGroup) || !programRaw || !semester) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }
        const data = yield (0, curriculumService_1.getSemesterData)(yearGroup, programRaw, semester);
        return res.json(data || { slots: [], rules: [] });
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Server error' });
    }
}));
router.post('/:yearGroup/:program/:semester', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const yearGroup = parseInt(req.params.yearGroup, 10);
        const programRaw = decodeURIComponent(req.params.program || '');
        const semester = req.params.semester;
        if (!Number.isFinite(yearGroup) || !programRaw || !semester) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }
        yield (0, curriculumService_1.saveSemesterData)(yearGroup, programRaw, semester, req.body);
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Server error' });
    }
}));
exports.default = router;
