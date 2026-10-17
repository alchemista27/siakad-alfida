#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

CONTRACT_TESTS=(
  "scripts/test-acceptance-letter-contract.ts"
  "scripts/test-capacity-contract.ts"
  "scripts/test-cors-policy.ts"
  "scripts/test-decision-contract.ts"
  "scripts/test-document-upload-contract.ts"
  "scripts/test-dossier-review-contract.ts"
  "scripts/test-handoff-contract.ts"
  "scripts/test-handoff-outbox-contract.ts"
  "scripts/test-observation-schedule-contract.ts"
  "scripts/test-observer-scope-contract.ts"
  "scripts/test-offline-claim-contract.ts"
  "scripts/test-offline-import-workflow-contract.ts"
  "scripts/test-parent-registration-access.ts"
  "scripts/test-parent-registration-policy.ts"
  "scripts/test-parent-workflow.ts"
  "scripts/test-period-management-contract.ts"
  "scripts/test-rbac.ts"
  "scripts/test-registration-tracking-access.ts"
  "scripts/test-registration-workflow-contract.ts"
  "scripts/test-spmb-scope-policy.ts"
  "scripts/test-unit-scoped-staff.ts"
  "scripts/test-workflow-guards.ts"
)

echo "=== SPMB API Contracts Runner ==="
echo "Verifying contract files exist..."

for test_file in "${CONTRACT_TESTS[@]}"; do
  if [[ ! -f "$test_file" ]]; then
    echo "ERROR: Missing contract test file: $test_file" >&2
    exit 1
  fi
done

echo "All ${#CONTRACT_TESTS[@]} contract test files found. Running contracts..."
echo "--------------------------------------------------------"

for test_file in "${CONTRACT_TESTS[@]}"; do
  echo ">>> Running $test_file"
  npm exec --yes --package tsx -- tsx "$test_file"
  echo ""
done

echo "========================================================"
echo "All ${#CONTRACT_TESTS[@]} SPMB API contract tests passed successfully."
