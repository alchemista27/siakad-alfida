import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getReading, type ReadingTime, type ReadingVariant } from "../lib/almatsurat-reading";
import { colors, radius, space } from "../theme/tokens";

export function AlmatsuratCard() {
  const [variant, setVariant] = useState<ReadingVariant>("sugro");
  const [time, setTime] = useState<ReadingTime>("pagi");
  const items = getReading(variant, time);

  return <View style={styles.card}>
    <Text style={styles.title}>Al-Ma’tsurat</Text>
    <Text style={styles.intro}>Bacaan Arab tersimpan di aplikasi. Pilih versi dan waktu untuk membaca tanpa jaringan.</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Pilih versi Al-Ma’tsurat" style={styles.controls}>
      {(["sugro", "kubro"] as const).map(value =>
        <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Versi ${value}`} accessibilityState={{ selected: variant === value }}
          onPress={() => setVariant(value)} style={[styles.choice, variant === value && styles.selected]}>
          <Text style={[styles.choiceText, variant === value && styles.selectedText]}>{value === "sugro" ? "Sugro" : "Kubro"}</Text>
        </Pressable>
      )}
    </View>
    <View accessibilityRole="radiogroup" accessibilityLabel="Pilih waktu bacaan" style={styles.controls}>
      {(["pagi", "petang"] as const).map(value =>
        <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Waktu ${value}`} accessibilityState={{ selected: time === value }}
          onPress={() => setTime(value)} style={[styles.choice, time === value && styles.selected]}>
          <Text style={[styles.choiceText, time === value && styles.selectedText]}>{value === "pagi" ? "Pagi" : "Petang"}</Text>
        </Pressable>
      )}
    </View>
    <Text accessibilityRole="header" style={styles.sectionTitle}>Bacaan {variant === "sugro" ? "Sugro" : "Kubro"} · {time === "pagi" ? "Pagi" : "Petang"}</Text>
    <Text style={styles.credit}>Sumber: aliifam/almatsurat (MIT © 2024 Aliif Arief), melalui @guidelightid/almatsurat.</Text>
    {items.map((item, index) => <View key={`${variant}-${time}-${index}`} style={styles.reading}>
      <View style={styles.readingHeader}>
        <Text accessibilityRole="header" style={styles.itemTitle}>{index + 1}. {item.title}</Text>
        <Text style={styles.repeat}>Dibaca {item.repeat}×</Text>
      </View>
      {item.verses.map((verse, verseIndex) =>
        <Text key={verseIndex} style={styles.arabic}>{verse}</Text>
      )}
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: space.lg, gap: space.md },
  title: { fontFamily: "Lora", color: colors.primary, fontSize: 21, fontWeight: "700" },
  intro: { fontFamily: "Inter", color: colors.primary, fontSize: 13, lineHeight: 20 },
  controls: { flexDirection: "row", gap: space.sm },
  choice: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: space.sm },
  selected: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  choiceText: { fontFamily: "Inter", color: colors.tertiary, fontSize: 14, fontWeight: "700" },
  selectedText: { color: colors.onTertiary },
  sectionTitle: { fontFamily: "Lora", color: colors.primary, fontSize: 17, fontWeight: "700" },
  credit: { fontFamily: "Inter", color: colors.primary, fontSize: 11, lineHeight: 17 },
  reading: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: space.md, gap: space.sm },
  readingHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: space.sm },
  itemTitle: { fontFamily: "Lora", color: colors.primary, fontSize: 16, fontWeight: "700", flexShrink: 1 },
  repeat: { fontFamily: "Inter", color: colors.tertiary, fontSize: 12, fontWeight: "700" },
  arabic: { color: colors.primary, fontSize: 26, lineHeight: 46, textAlign: "right", writingDirection: "rtl", paddingVertical: space.sm },
});
