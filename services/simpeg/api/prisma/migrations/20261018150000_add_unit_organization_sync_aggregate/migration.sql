-- Add the canonical aggregate kind for SIAKAD unit projection outbox records.
ALTER TYPE "OrganizationSyncAggregate" ADD VALUE IF NOT EXISTS 'unit';
