import { StyleSheet, Text, View } from "react-native";
import { PRAYER_METHOD, type PrayerSlot } from "../lib/prayer-times";
import { colors, radius, space } from "../theme/tokens";

type Props = { slots: PrayerSlot[]; timezone: string; accuracyMeters: number };

export function PrayerTimesCard({ slots, timezone, accuracyMeters }: Props) {
  const format = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone,
  });
  return <View style={styles.card}>
    <Text style={styles.title}>Jadwal salat</Text>
    {slots.map(slot => <View key={slot.key} style={styles.row}>
      <Text style={styles.name}>{slot.label}</Text>
      <Text style={styles.time}>{format.format(slot.at)}</Text>
    </View>)}
    <Text style={styles.note}>{PRAYER_METHOD}. Perhitungan mengikuti lokasi, ditampilkan pada zona waktu perangkat ({timezone}); aktifkan zona waktu otomatis bila bepergian atau jam tidak sesuai lokasi. Akurasi lokasi ±{Math.round(accuracyMeters)} m.</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: space.lg, gap: space.sm },
  title: { fontFamily: "Lora", color: colors.primary, fontSize: 21, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: space.sm, borderBottomColor: colors.border, borderBottomWidth: 1 },
  name: { fontFamily: "Inter", color: colors.primary, fontSize: 15 },
  time: { fontFamily: "Inter", color: colors.tertiary, fontSize: 15, fontWeight: "700" },
  note: { fontFamily: "Inter", color: colors.primary, fontSize: 12, lineHeight: 18 },
});
