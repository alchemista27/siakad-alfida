import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { AuthProfile } from "../lib/auth-profile";
import { colors, radius, space } from "../theme/tokens";

type Props = {
  profile: AuthProfile | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

function initials(fullName: string) {
  return fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "A";
}

function roleLabel(role: { app?: string; role: string }) {
  const app = role.app ? `${role.app.toUpperCase()} · ` : "";
  return `${app}${role.role.replaceAll("_", " ")}`;
}

export function ProfilePage({ profile, loading, error, onRetry }: Props) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  if (loading) return <View style={styles.card}><ActivityIndicator color={colors.tertiary} /><Text style={styles.copy}>Memuat profil…</Text></View>;
  if (error || !profile) return <View style={styles.card}><Text accessibilityRole="alert" style={styles.copy}>{error || "Profil belum dapat dimuat."}</Text><Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Coba lagi</Text></Pressable></View>;
  return <View style={styles.card}>
    <View style={styles.hero}>
      {profile.avatarUrl && !avatarFailed
        ? <Image accessibilityLabel={`Foto ${profile.fullName}`} onError={() => setAvatarFailed(true)} source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        : <View accessibilityLabel={`Inisial ${profile.fullName}`} style={styles.initials}><Text style={styles.initialsText}>{initials(profile.fullName)}</Text></View>}
      <View style={styles.heroText}><Text style={styles.name}>{profile.fullName}</Text><Text style={styles.email}>{profile.email}</Text></View>
    </View>
    <View style={styles.divider} />
    <Detail label="Nomor HP" value={profile.phone || "Belum diisi"} />
    <Text style={styles.label}>ROLE AKTIF</Text>
    <View style={styles.roles}>{profile.roles.length ? profile.roles.map((role, index) => <Text key={`${role.app ?? "global"}-${role.role}-${index}`} style={styles.role}>{roleLabel(role)}</Text>) : <Text style={styles.copy}>Belum ada role aktif.</Text>}</View>
  </View>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.copy}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: space.md, padding: space.lg },
  hero: { alignItems: "center", flexDirection: "row", gap: space.md },
  heroText: { flex: 1, gap: 3 },
  avatar: { borderColor: colors.border, borderRadius: 40, borderWidth: 1, height: 80, width: 80 },
  initials: { alignItems: "center", backgroundColor: colors.tertiary, borderRadius: 40, height: 80, justifyContent: "center", width: 80 },
  initialsText: { color: colors.onTertiary, fontFamily: "Lora", fontSize: 26, fontWeight: "700" },
  name: { color: colors.primary, fontFamily: "Lora", fontSize: 22, fontWeight: "700" },
  email: { color: colors.primary, fontFamily: "Inter", fontSize: 13 },
  divider: { backgroundColor: colors.border, height: 1 },
  detail: { gap: 3 },
  label: { color: colors.tertiary, fontFamily: "Inter", fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  value: { color: colors.primary, fontFamily: "Inter", fontSize: 15, fontWeight: "700" },
  copy: { color: colors.primary, fontFamily: "Inter", fontSize: 14, lineHeight: 21 },
  roles: { gap: space.sm },
  role: { backgroundColor: colors.neutral, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, color: colors.primary, fontFamily: "Inter", fontSize: 13, overflow: "hidden", paddingHorizontal: space.md, paddingVertical: space.sm },
  retry: { alignSelf: "flex-start", paddingVertical: space.sm },
  retryText: { color: colors.tertiary, fontFamily: "Inter", fontWeight: "700" },
});
