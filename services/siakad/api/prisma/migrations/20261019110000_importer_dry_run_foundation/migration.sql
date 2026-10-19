CREATE TABLE "siakad"."import_source_mappings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "unit_id" UUID NOT NULL,
  "source_system" VARCHAR(100) NOT NULL,
  "entity_type" VARCHAR(100) NOT NULL,
  "mapping_version" VARCHAR(100) NOT NULL,
  "mapping" JSONB NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  "updated_by_user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "import_source_mappings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "import_source_mappings_unit_id_source_system_entity_type_mapping_version_key"
    UNIQUE ("unit_id", "source_system", "entity_type", "mapping_version"),
  CONSTRAINT "import_source_mappings_unit_id_fkey"
    FOREIGN KEY ("unit_id") REFERENCES "siakad"."unit_projections"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "import_source_mappings_unit_id_source_system_idx"
  ON "siakad"."import_source_mappings" ("unit_id", "source_system");
