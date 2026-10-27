export class CreateSetoranDto {
  date: string;
  jenis: "tilawah" | "ziyadah" | "murojaah";
  surahMulai: string;
  ayatMulai: number;
  surahSelesai: string;
  ayatSelesai: number;
  jumlahHalaman: number;
  catatan?: string;
}

export class VerifySetoranDto {
  status: "verified" | "revision";
  catatanPembina?: string;
}
