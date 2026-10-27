import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const completeStudent = {
  fullName: "Ahmad Fauzi",
  nickname: "Ahmad",
  gender: "male",
  religion: "Islam",
  birthPlace: "Bandung",
  birthDate: new Date("2019-05-10"),
  nisn: null,
  siblingsCount: 2,
  address: "Jl. Melati Nomor 10, Bandung",
  transportation: "Diantar orang tua",
};

const service = new RegistrationsService({} as any);
const complete = (service as any).sanitizeForParent({ id: "reg-complete", studentData: completeStudent });
const incomplete = (service as any).sanitizeForParent({
  id: "reg-incomplete",
  studentData: { ...completeStudent, transportation: null },
});

assert(complete.studentDataComplete === true, "parent payload must declare complete persisted murid data");
assert(incomplete.studentDataComplete === false, "parent payload must declare incomplete persisted murid data");

console.log("SPMB parent-form navigation contract passed");
