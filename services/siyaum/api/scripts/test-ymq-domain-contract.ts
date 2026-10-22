import assert from "node:assert/strict";
import {
  validateCurriculumUnitInput,
  validateLearningProgressInput,
  validateSequence,
} from "../src/ymq/ymq-domain";

const iwrUnitId = "11111111-1111-4111-8111-111111111111";

assert.deepEqual(
  validateLearningProgressInput({
    track: "pra_tahsin",
    sequence: 1,
    iwrCurriculumUnitId: iwrUnitId,
    surahNumber: null,
    ayahStart: null,
    ayahEnd: null,
  }),
  { valid: true },
);
assert.equal(
  validateLearningProgressInput({
    track: "pra_tahsin",
    sequence: 1,
    iwrCurriculumUnitId: null,
    surahNumber: null,
    ayahStart: null,
    ayahEnd: null,
  }).valid,
  false,
);
assert.equal(
  validateLearningProgressInput({
    track: "pra_tahsin",
    sequence: 1,
    iwrCurriculumUnitId: iwrUnitId,
    surahNumber: 2,
    ayahStart: null,
    ayahEnd: null,
  }).valid,
  false,
);
assert.deepEqual(
  validateLearningProgressInput({
    track: "tahsin",
    sequence: 1,
    iwrCurriculumUnitId: null,
    surahNumber: 2,
    ayahStart: 1,
    ayahEnd: 5,
  }),
  { valid: true },
);
assert.equal(
  validateLearningProgressInput({
    track: "tahsin",
    sequence: 1,
    iwrCurriculumUnitId: null,
    surahNumber: 2,
    ayahStart: 6,
    ayahEnd: 5,
  }).valid,
  false,
);
assert.deepEqual(
  validateLearningProgressInput({
    track: "ziyadah",
    sequence: 1,
    iwrCurriculumUnitId: null,
    surahNumber: 114,
    ayahStart: null,
    ayahEnd: null,
  }),
  { valid: true },
);
assert.equal(
  validateLearningProgressInput({
    track: "ziyadah",
    sequence: 1,
    iwrCurriculumUnitId: null,
    surahNumber: 114,
    ayahStart: 1,
    ayahEnd: null,
  }).valid,
  false,
);
assert.equal(validateSequence(0).valid, false);
assert.equal(validateSequence(1).valid, true);
assert.equal(validateSequence(1.5).valid, false);
assert.equal(validateCurriculumUnitInput({ topicCode: "", pageStart: 1, pageEnd: 2 }).valid, false);
assert.equal(validateCurriculumUnitInput({ topicCode: "IWR1-01", pageStart: 4, pageEnd: 3 }).valid, false);
assert.equal(validateCurriculumUnitInput({ topicCode: "IWR1-01", pageStart: 1, pageEnd: 3 }).valid, true);

console.log("SIYAUM YMQ domain contract passed");
