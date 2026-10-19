import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateImportSourceMappingDto {
  unitId: string;
  sourceSystem: string;
  entityType: string;
  mappingVersion: string;
  mapping: unknown;
}

export interface ImportDryRunDto {
  mappingId: string;
  records: unknown[];
}

type NormalizedMapping = { recordKey: string; fields: Record<string, string> };

function text(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new BadRequestException(`${field} wajib diisi`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BadRequestException(`${field} tidak valid`);
  return normalized;
}

function normalizeMapping(value: unknown): NormalizedMapping {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new BadRequestException("Konfigurasi mapping tidak valid");
  const candidate = value as { recordKey?: unknown; fields?: unknown };
  const recordKey = text(candidate.recordKey, "recordKey", 100);
  if (!candidate.fields || typeof candidate.fields !== "object" || Array.isArray(candidate.fields)) {
    throw new BadRequestException("fields mapping wajib berupa objek");
  }
  const entries = Object.entries(candidate.fields).map(([target, source]) => [text(target, "Target field", 100), text(source, "Source field", 100)] as const);
  if (!entries.length) throw new BadRequestException("fields mapping tidak boleh kosong");
  return { recordKey, fields: Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b))) };
}

function sameMapping(left: unknown, right: NormalizedMapping): boolean {
  try { return JSON.stringify(normalizeMapping(left)) === JSON.stringify(right); } catch { return false; }
}

@Injectable()
export class ImporterService {
  constructor(private readonly prisma: PrismaService) {}

  async listMappings(principal: SiakadPrincipal) {
    const unitIds = isSuperAdmin(principal) ? undefined : [...allowedUnitIds(principal, ["admin_unit"])];
    if (unitIds && unitIds.length === 0) return [];
    return this.prisma.importSourceMapping.findMany({
      where: unitIds ? { unitId: { in: unitIds } } : {},
      orderBy: [{ sourceSystem: "asc" }, { entityType: "asc" }, { mappingVersion: "asc" }],
    });
  }

  async createMapping(principal: SiakadPrincipal, dto: CreateImportSourceMappingDto) {
    const unitId = text(dto.unitId, "Unit", 100);
    assertUnitAccess(principal, unitId);
    const sourceSystem = text(dto.sourceSystem, "Sistem sumber", 100);
    const entityType = text(dto.entityType, "Jenis entitas", 100);
    const mappingVersion = text(dto.mappingVersion, "Versi mapping", 100);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(mappingVersion)) throw new BadRequestException("Versi mapping hanya boleh memuat huruf, angka, titik, garis bawah, atau garis hubung");
    const mapping = normalizeMapping(dto.mapping);
    const existing = await this.prisma.importSourceMapping.findUnique({
      where: { unitId_sourceSystem_entityType_mappingVersion: { unitId, sourceSystem, entityType, mappingVersion } },
    });
    if (existing) {
      if (!sameMapping(existing.mapping, mapping)) throw new ConflictException("Versi mapping sudah dipakai dengan konfigurasi berbeda");
      return { mapping: existing, idempotent: true };
    }
    const created = await this.prisma.importSourceMapping.create({
      data: { unitId, sourceSystem, entityType, mappingVersion, mapping: mapping as any, createdByUserId: principal.id, updatedByUserId: principal.id },
    });
    return { mapping: created, idempotent: false };
  }

  async dryRun(principal: SiakadPrincipal, dto: ImportDryRunDto) {
    if (!Array.isArray(dto.records)) throw new BadRequestException("records wajib berupa daftar");
    const mapping = await this.getScopedMapping(principal, dto.mappingId);
    const config = normalizeMapping(mapping.mapping);
    const seenKeys = new Set<string>();
    let validCount = 0;
    let duplicateKeyCount = 0;
    let invalidCount = 0;
    for (const row of dto.records) {
      const candidate = row && typeof row === "object" && !Array.isArray(row) ? row as Record<string, unknown> : null;
      const rawKey = candidate?.[config.recordKey];
      const key = typeof rawKey === "string" || typeof rawKey === "number" ? String(rawKey).trim() : "";
      const missingField = !candidate || Object.values(config.fields).some((field) => {
        const value = candidate[field];
        return !((typeof value === "string" && value.trim()) || typeof value === "number");
      });
      if (!key || seenKeys.has(key) || missingField) {
        invalidCount += 1;
        if (key && seenKeys.has(key)) duplicateKeyCount += 1;
        if (key) seenKeys.add(key);
        continue;
      }
      seenKeys.add(key);
      validCount += 1;
    }
    return {
      dryRun: true,
      writePerformed: false,
      execution: "dry_run_only",
      wouldWriteCount: 0,
      mapping: { id: mapping.id, sourceSystem: mapping.sourceSystem, entityType: mapping.entityType, mappingVersion: mapping.mappingVersion },
      reconciliation: { receivedCount: dto.records.length, validCount, invalidCount, duplicateKeyCount },
      notice: "Impor historis tidak dapat dijalankan tanpa konfigurasi mapping sumber terpisah; endpoint ini hanya membuat laporan dry-run.",
    };
  }

  private async getScopedMapping(principal: SiakadPrincipal, id: string): Promise<any> {
    const mapping = await this.prisma.importSourceMapping.findFirst({ where: { id } });
    if (!mapping) throw new NotFoundException("Mapping sumber impor tidak ditemukan");
    assertUnitAccess(principal, mapping.unitId);
    return mapping;
  }
}
