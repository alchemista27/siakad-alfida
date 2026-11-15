-- Parent-selected group for a shared TK admission period.
-- Nullable so legacy records remain valid and non-TK student data is unaffected.
ALTER TABLE "student_data"
  ADD COLUMN IF NOT EXISTS "tk_group" "TkGroup";
