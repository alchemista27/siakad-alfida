import assert from "node:assert/strict";
import { validateLearningSessionPayload } from "../src/sessions/sessions.policy";

const payload = {
  groupId: "11111111-1111-4111-8111-111111111111",
  sessionDate: "2026-10-22",
  notes: "Pertemuan pekanan",
  attendance: [{ memberId: "22222222-2222-4222-8222-222222222222", status: "hadir", note: null }],
  progress: [{
    memberId: "22222222-2222-4222-8222-222222222222",
    track: "tahsin",
    sequence: 1,
    iwrCurriculumUnitId: null,
    surahNumber: 2,
    ayahStart: 1,
    ayahEnd: 5,
    note: "Makharij huruf",
  }],
};

assert.equal(validateLearningSessionPayload(payload, new Set([payload.attendance[0].memberId]), "tahsin").valid, true);
assert.equal(validateLearningSessionPayload({ ...payload, attendance: [...payload.attendance, payload.attendance[0]] }, new Set([payload.attendance[0].memberId]), "tahsin").valid, false);
assert.equal(validateLearningSessionPayload(payload, new Set(), "tahsin").valid, false);
assert.equal(validateLearningSessionPayload(payload, new Set([payload.attendance[0].memberId]), "pra_tahsin").valid, false);
assert.equal(validateLearningSessionPayload({ ...payload, progress: [{ ...payload.progress[0], track: "ziyadah", ayahStart: 1, ayahEnd: null }] }, new Set([payload.attendance[0].memberId]), "tahfiz").valid, false);
assert.equal(validateLearningSessionPayload({ ...payload, progress: [{ ...payload.progress[0], sequence: 0 }] }, new Set([payload.attendance[0].memberId]), "tahsin").valid, false);

console.log("SIYAUM learning session contract passed");
