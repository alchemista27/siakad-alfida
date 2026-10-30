-- Restores the workflow state used when an IMC/medical_result document is accepted.
-- IF NOT EXISTS keeps this forward migration safe for environments where the value
-- was added manually before migration history was corrected.
ALTER TYPE "RegistrationStatus" ADD VALUE IF NOT EXISTS 'medical_uploaded';
