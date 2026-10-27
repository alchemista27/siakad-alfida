import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function run() {
  const modalPath = path.resolve(__dirname, "../src/components/user-role-modal.tsx");
  const content = fs.readFileSync(modalPath, "utf-8");

  // 1. Tidak boleh ada input teks manual untuk departmentId / UUID bidang
  assert.doesNotMatch(
    content,
    /<input[^>]+value=\{departmentId\}/,
    "Input teks manual departmentId harus diganti dengan elemen <select> dropdown",
  );

  // 2. Wajib ada dropdown select untuk departmentId (Bidang)
  assert.match(
    content,
    /<select[^>]+value=\{departmentId\}/,
    "Wajib memiliki dropdown select untuk departmentId",
  );

  // 3. Wajib ada dropdown select untuk unitId (Unit Kerja)
  assert.match(
    content,
    /<select[^>]+value=\{unitId\}/,
    "Wajib memiliki dropdown select untuk unitId pada peran berscope unit",
  );

  // 4. Tombol submit tidak boleh didisable secara kaku untuk scope unit
  assert.doesNotMatch(
    content,
    /disabled=\{[^}]*scope === "unit"/,
    "Tombol simpan tidak boleh didisable secara kaku untuk scope unit jika unit telah dipilih",
  );

  // 5. Unit non-pendidikan wajib membatasi aplikasi ke SIMPEG.
  assert.match(content, /category:\s*"pendidikan"\s*\|\s*"nondik"/, "Katalog unit harus menyertakan category pendidikan/nondik");
  assert.match(content, /selectedUnit\?\.category\s*===\s*"nondik"/, "UI harus membedakan unit non-pendidikan");
  assert.match(content, /app\s*===\s*"siakad"\s*\|\|\s*app\s*===\s*"spmb"/, "UI harus mencegah penugasan SIAKAD/SPMB untuk unit non-pendidikan");

  console.log("User role dropdown UI contract passed");
}

run();
