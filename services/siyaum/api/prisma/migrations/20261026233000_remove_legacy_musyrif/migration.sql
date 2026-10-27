-- Backfill only unambiguous legacy ownership before deleting the duplicate field.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM ymq_groups
    WHERE musyrif_id IS NOT NULL
      AND pembina_user_id IS NOT NULL
      AND musyrif_id <> pembina_user_id
  ) THEN
    RAISE EXCEPTION 'Cannot remove musyrif_id: conflicting pembina assignment exists';
  END IF;
END $$;

UPDATE ymq_groups
SET pembina_user_id = musyrif_id
WHERE pembina_user_id IS NULL
  AND musyrif_id IS NOT NULL;

ALTER TABLE ymq_groups DROP CONSTRAINT IF EXISTS ymq_groups_musyrif_id_fkey;
ALTER TABLE ymq_groups DROP COLUMN IF EXISTS musyrif_id;
