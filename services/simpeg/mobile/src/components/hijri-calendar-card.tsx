import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { hijriAt, hijriMonth } from "../lib/hijri-calendar";
import { colors, radius, space } from "../theme/tokens";

type Props = { now: Date; timeZone: string };
const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function HijriCalendarCard({ now, timeZone }: Props) {
  const [offset, setOffset] = useState(0);
  let today: ReturnType<typeof hijriAt>;
  let month: ReturnType<typeof hijriMonth>;
  try {
    today = hijriAt(now, timeZone);
    month = hijriMonth(today.add({ months: offset }));
  } catch {
    return <View style={styles.card}>
      <Text style={styles.title}>Kalender Hijriyah</Text>
      <Text accessibilityRole="alert" style={styles.note}>Kalender tidak tersedia untuk tanggal atau zona waktu ini. Periksa pengaturan zona waktu perangkat.</Text>
    </View>;
  }

  return <View style={styles.card}>
    <Text style={styles.title}>Kalender Hijriyah · {month.title}</Text>
    <Text style={styles.note}>Perkiraan Umm al-Qura, bukan penetapan resmi Kemenag Indonesia. Tanggal sipil mengikuti zona waktu perangkat ({timeZone}) dan berganti pukul 00.00, bukan saat magrib.</Text>
    <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="Bulan sebelumnya" disabled={offset <= -120} onPress={() => setOffset(v => v - 1)}>
        <Text style={styles.action}>‹ Bulan sebelumnya</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke bulan ini" onPress={() => setOffset(0)}>
        <Text style={styles.action}>Bulan ini</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Bulan berikutnya" disabled={offset >= 120} onPress={() => setOffset(v => v + 1)}>
        <Text style={styles.action}>Bulan berikutnya ›</Text>
      </Pressable>
    </View>
    <View style={styles.grid}>
      {WEEKDAYS.map(day => <Text key={day} style={[styles.cell, styles.weekday]}>{day}</Text>)}
      {month.cells.map(cell => <View key={cell.key} accessible accessibilityLabel={`${cell.hijri.day} Hijriyah, ${cell.gregorian.day}/${cell.gregorian.month}/${cell.gregorian.year} Masehi${cell.hijri.compare(today) === 0 ? ", hari ini" : ""}`} style={[styles.cell, !cell.inMonth && styles.outside, cell.hijri.compare(today) === 0 && styles.today]}>
        <Text style={styles.day}>{cell.hijri.day}</Text>
        <Text style={styles.companion}>{cell.gregorian.day}/{cell.gregorian.month}</Text>
      </View>)}
    </View>
    <Text style={styles.note}>Angka besar: Hijriyah · angka kecil: Masehi. Tanggal dapat berbeda dari hasil rukyat dan keputusan otoritas setempat.</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: space.lg, gap: space.sm },
  title: { fontFamily: "Lora", color: colors.primary, fontSize: 21, fontWeight: "700" },
  note: { fontFamily: "Inter", color: colors.primary, fontSize: 12, lineHeight: 18 },
  controls: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: space.sm },
  action: { fontFamily: "Inter", color: colors.tertiary, fontSize: 12, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", minHeight: 42, borderColor: colors.border, borderWidth: 0.5, padding: 2 },
  weekday: { fontFamily: "Inter", color: colors.primary, textAlign: "center", minHeight: 24 },
  outside: { opacity: 0.4 },
  today: { borderColor: colors.tertiary, borderWidth: 2, borderRadius: radius.sm },
  day: { fontFamily: "Inter", color: colors.primary, fontSize: 14, fontWeight: "700" },
  companion: { fontFamily: "Inter", color: colors.primary, fontSize: 10 },
});
