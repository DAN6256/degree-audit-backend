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
exports.listYearGroups = listYearGroups;
exports.upsertYearGroup = upsertYearGroup;
exports.listPrograms = listPrograms;
exports.upsertProgram = upsertProgram;
const firebaseService_1 = require("../services/firebaseService");
function listYearGroups(_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const arr = yield (0, firebaseService_1.listYearGroupsSvc)();
        res.json(arr.map((y) => ({ yearGroup: y, programs: [] })));
    });
}
function upsertYearGroup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { yearGroup } = req.body || {};
        const yg = parseInt(yearGroup, 10);
        if (!Number.isFinite(yg)) {
            res.status(400).json({ message: 'yearGroup required' });
            return;
        }
        yield (0, firebaseService_1.upsertYearGroupSvc)(yg);
        res.json({ ok: true });
    });
}
function listPrograms(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const yg = parseInt(req.params.yearGroup, 10);
        if (!Number.isFinite(yg)) {
            res.status(400).json({ message: 'bad yearGroup' });
            return;
        }
        const progs = yield (0, firebaseService_1.listProgramsSvc)(yg);
        res.json(progs);
    });
}
function upsertProgram(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const yg = parseInt(req.params.yearGroup, 10);
        if (!Number.isFinite(yg)) {
            res.status(400).json({ message: 'bad yearGroup' });
            return;
        }
        const meta = req.body;
        if (!(meta === null || meta === void 0 ? void 0 : meta.displayName)) {
            res.status(400).json({ message: 'displayName required' });
            return;
        }
        yield (0, firebaseService_1.upsertProgramSvc)(yg, meta);
        res.json({ ok: true });
    });
}
