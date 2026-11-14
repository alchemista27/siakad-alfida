import { createServer, type ServerResponse } from "node:http";
import {
  COMPLETE_UNIT_ID,
  FOUNDATION_FALLBACK_ID,
  INVALID_MODE_ID,
  MEDICAL_FOUNDATION_ID,
  acceptanceLetter,
  medicalReferralLetter,
  parentRegistration,
} from "./letterhead-fixtures";

const port = 3101;

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
  if (request.method !== "GET") return json(response, 405, { message: "Method not allowed" });
  if (url.pathname === "/__e2e__/health") return json(response, 200, { ok: true });

  if (url.pathname === `/api/registrations/parent/${COMPLETE_UNIT_ID}`) {
    return json(response, 200, parentRegistration(COMPLETE_UNIT_ID, "accepted"));
  }
  if (url.pathname === `/api/registrations/parent/${MEDICAL_FOUNDATION_ID}`) {
    return json(response, 200, parentRegistration(MEDICAL_FOUNDATION_ID, "medical_pending"));
  }

  if (url.pathname === `/api/letters/acceptance/${COMPLETE_UNIT_ID}`) return json(response, 200, acceptanceLetter("unit"));
  if (url.pathname === `/api/letters/acceptance/${FOUNDATION_FALLBACK_ID}`) return json(response, 200, acceptanceLetter("foundation"));
  if (url.pathname === `/api/letters/acceptance/${INVALID_MODE_ID}`) {
    return json(response, 200, { ...acceptanceLetter("foundation"), letterheadKind: "invalid" });
  }
  if (url.pathname === `/api/letters/medical-referral/${MEDICAL_FOUNDATION_ID}`) {
    return json(response, 200, medicalReferralLetter());
  }

  return json(response, 404, { message: "Fixture endpoint not found" });
}).listen(port, "127.0.0.1", () => {
  console.log(`SPMB letterhead E2E fixture listening on http://127.0.0.1:${port}`);
});
