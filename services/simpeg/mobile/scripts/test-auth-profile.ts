import assert from "node:assert/strict";
import { getAuthProfile } from "../src/lib/auth-profile";

async function main() {
  const user = await getAuthProfile("token", async (_url, init) => {
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer token");
    return new Response(JSON.stringify({ success: true, user: {
      id: "user-1", fullName: "Pengguna Alfida", email: "user@example.test",
      phone: "081234567890", avatarUrl: null, roles: [{ app: "simpeg", role: "pegawai" }],
    } }), { status: 200 });
  });
  assert.equal(user.fullName, "Pengguna Alfida");
  await assert.rejects(
    () => getAuthProfile("token", async () => new Response("{}", { status: 401 })),
    /Sesi berakhir/,
  );
  console.log("auth profile contract passed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
