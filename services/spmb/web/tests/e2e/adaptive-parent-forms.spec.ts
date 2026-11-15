import { expect, test, type Page } from "@playwright/test";

const studentRegistrationId = "11111111-1111-4111-8111-111111111111";
const tkStudentRegistrationId = "33333333-3333-4333-8333-333333333334";
const parentRegistrationId = "22222222-2222-4222-8222-222222222222";

async function setFixtureSession(page: Page) {
  await page.context().addCookies([{
    name: "alfida_session",
    value: "fixture-session",
    domain: "127.0.0.1",
    path: "/",
  }]);
}

test("SMP student form visibly renders structured Dapodik and prior-school fields", async ({ page }) => {
  await setFixtureSession(page);
  await page.goto(`/parent/form-student?registrationId=${studentRegistrationId}`);

  await expect(page.getByRole("heading", { name: "Formulir Data Murid" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data Kependudukan & Domisili" })).toBeVisible();
  await expect(page.getByText("NIK Murid *")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data Sekolah Asal & Kelulusan" })).toBeVisible();
  await expect(page.getByText("Nomor SKL/Ijazah *")).toBeVisible();
});

test("TK student form visibly requires a parent-selected group", async ({ page }) => {
  await setFixtureSession(page);
  await page.goto(`/parent/form-student?registrationId=${tkStudentRegistrationId}`);

  const tkGroup = page.getByLabel("Kelompok TK *");
  await expect(tkGroup).toBeVisible();
  await expect(tkGroup).toHaveValue("");
  await expect(tkGroup.locator("option")).toHaveText(["Pilih kelompok", "Kelompok A", "Kelompok B"]);
  await tkGroup.selectOption("b");
  await expect(tkGroup).toHaveValue("b");
});

test("guardian form is visibly required when residence is with guardian", async ({ page }) => {
  await setFixtureSession(page);
  await page.goto(`/parent/form-parents?registrationId=${parentRegistrationId}`);

  await expect(page.getByRole("heading", { name: "Formulir Data Orang Tua" })).toBeVisible();
  await expect(page.getByText("Data wali wajib diisi karena tempat tinggal murid tercatat bersama wali.")).toBeVisible();
  await expect(page.getByRole("group", { name: "Data Wali" })).toBeVisible();
});
